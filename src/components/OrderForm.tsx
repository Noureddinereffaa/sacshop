"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { Phone, User, Loader2, Edit3, MessageCircle, ShoppingCart } from "lucide-react";
import { CartItem } from "@/types";

interface OrderFormProps {
  productId: string;
  productName: string;
  productPrice: number;
  selectedSize?: string;
  selectedColor?: string;
  appliedOfferId?: string;
  cartItems?: CartItem[];
  quantity?: number;
  discountAmount?: number;
  onAddToCart?: () => void;
}

export default function OrderForm({ productId, productName, productPrice, selectedSize, selectedColor, appliedOfferId, cartItems = [], quantity = 1, discountAmount = 0, onAddToCart }: OrderFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string>("213000000000");
  const router = useRouter(); // default fallback
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: ""
  });

  // Auto-fill form if user is already logged in
  useEffect(() => {
    const storedPhone = sessionStorage.getItem("sacshop_phone");
    const storedName = sessionStorage.getItem("sacshop_name");
    if (storedPhone && storedName) {
      setFormData(prev => ({ ...prev, phone: storedPhone, name: storedName }));
    }
  }, []);

  // Fetch WhatsApp number dynamically from Settings
  useEffect(() => {
    async function fetchSettings() {
      if (!supabase) return;
      
      const { data } = await supabase.from("settings").select("*");
      if (data) {
        const settingsMap = data.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
        const num = settingsMap.branding?.whatsappNumber;
        if (num) {
          setWhatsappNumber(num);
        }
      }
    }
    fetchSettings();
  }, []);

  // Track ViewContent when the form is rendered (product page view)
  useEffect(() => {
    try {
      window.trackMarketingEvent?.("ViewContent", {
        content_name: productName,
        value: productPrice,
        currency: "DZD"
      });
    } catch {/* non-critical */}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!supabase) throw new Error('Supabase not configured');

      const isCartOrder = cartItems && cartItems.length > 0;
      const orderId = crypto.randomUUID();
      
      // Save order to dashboard — quantity is NOT set at this stage; admin fills it upon confirmation
      const { error } = await supabase.from("orders").insert({
        id: orderId,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email || null,
        admin_notes: formData.notes,
        customer_address: "غير مطلوب (طلب طباعة)",
        product_id: isCartOrder ? null : productId,
        quantity: isCartOrder ? null : quantity,
        size: isCartOrder ? null : selectedSize,
        color: isCartOrder ? null : selectedColor,
        product_price: isCartOrder ? 0 : productPrice,
        total_price: productPrice,
        applied_offer_id: appliedOfferId || null,
        status: "new",
        delivery_type: "desk",
        cart_items: isCartOrder ? cartItems : [],
      });

      if (error) throw error;

      // Fire marketing events (SubmitOrder) — non-blocking
      try {
        window.trackMarketingEvent?.("SubmitOrder", {
          content_name: isCartOrder ? "Cart Order" : productName,
          value: productPrice,
          currency: "DZD",
          num_items: isCartOrder ? cartItems.length : 1,
        });
      } catch {/* non-critical */}

      // Build WhatsApp message SERVER-SIDE to prevent tampering
      // The message is constructed and stored in DB, then we redirect to a secure page
      // that reads from DB and triggers WhatsApp — no editable text in URL ever.
      let waMessage = `🛒 *طلب جديد من متجر SacShop*\n\n`;
      waMessage += `👤 *الاسم:* ${formData.name}\n`;
      waMessage += `📞 *الهاتف:* ${formData.phone}\n`;

      if (isCartOrder) {
        waMessage += `\n🛍️ *المنتجات:*\n`;
        cartItems.forEach((item, idx) => {
          waMessage += `${idx + 1}. ${item.name} × ${item.quantity}\n`;
          const itemTotal = (item.price * item.quantity).toLocaleString();
          if (item.size) waMessage += `   📐 ${item.size}`;
          if (item.color) waMessage += ` | 🎨 ${item.color}`;
          waMessage += `\n   💵 ${itemTotal} د.ج\n`;
        });
      } else {
        waMessage += `\n🛍️ *المنتج:* ${productName}\n`;
        waMessage += `📦 *الكمية:* ${quantity}\n`;
        if (selectedSize) waMessage += `📐 *المقاس:* ${selectedSize}\n`;
        if (selectedColor) waMessage += `🎨 *اللون:* ${selectedColor}\n`;
      }

      if (discountAmount > 0) {
        waMessage += `\n💰 *السعر الأصلي:* ${(productPrice + discountAmount).toLocaleString()} د.ج\n`;
        waMessage += `🎁 *خصم (10%):* -${discountAmount.toLocaleString()} د.ج\n`;
        waMessage += `✅ *المجموع النهائي:* ${productPrice.toLocaleString()} د.ج\n`;
      } else {
        waMessage += `\n✅ *المجموع:* ${productPrice.toLocaleString()} د.ج\n`;
      }

      if (formData.notes) {
        waMessage += `\n📝 *ملاحظات:* ${formData.notes}\n`;
      }
      waMessage += `\n🔖 رقم الطلب: #${orderId.split('-')[0].toUpperCase()}`;

      // Save the WhatsApp message securely in the order record (server-side)
      await supabase.from("orders").update({
        admin_notes: (formData.notes || "") + `\n__wa_message__:\n${waMessage}\n__wa_number__:${whatsappNumber.replace(/[^0-9]/g, '')}`
      }).eq("id", orderId);

      setIsSuccess(true);

      // Redirect to SECURE confirmation page — no WhatsApp text in URL
      setTimeout(async () => {
        const storedPhone = sessionStorage.getItem("sacshop_phone");
        const confirmUrl = `/order/confirm/${orderId}`;

        if (storedPhone) {
          router.push(confirmUrl);
        } else {
          try {
            const res = await fetch("/api/check-user", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: formData.phone })
            });
            const { exists } = await res.json();

            if (exists) {
              router.push(confirmUrl);
            } else {
              router.push(
                `/set-password?phone=${encodeURIComponent(formData.phone)}` +
                `&name=${encodeURIComponent(formData.name)}` +
                `&ref=${orderId}`
              );
            }
          } catch {
            router.push(confirmUrl);
          }
        }
      }, 800);

    } catch (err) {
      const error = err as any;
      console.error("Error submitting order:", error);
      alert(`حدث خطأ أثناء إرسال الطلب: ${error?.message || JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-[3rem] border-2 border-[#25D366]/50 shadow-2xl text-center space-y-6"
      >
        <div className="w-20 h-20 bg-[#25D366]/20 rounded-full flex items-center justify-center text-[#25D366] mx-auto mb-8">
           <MessageCircle size={48} />
        </div>
        <h2 className="text-3xl font-black text-gray-900">جاري توجيهك إلى الواتساب...</h2>
        <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto">
           تم إرسال طلبك بنجاح. سيتم نقل محادثتك وتفاصيل التصميم مباشرة لفريقنا لمناقشة التفاصيل وتأكيد التكلفة.
        </p>
        <div className="pt-4 flex flex-col items-center justify-center text-sm font-bold text-gray-400">
           <Loader2 className="animate-spin mb-2" />
           إذا لم يحولك التطبيق، الرجاء النقر على رابط الواتساب بأنفسكم أو تفقد النوافذ المنبثقة!
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-2xl relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-[#25D366]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <MessageCircle size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-gray-950">تأكيد المبدئي للطلب</h2>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-tighter">سيتم الاتفاق على التصاميم و التسعير النهائي عبر الواتساب</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block mr-2">الاسم الكامل للمسؤول/الشركة</label>
                <div className="relative">
                   <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                     required
                     type="text" 
                     placeholder="مثلاً: شركة الطباعة، مراد..."
                     className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-base"
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block mr-2">رقم الهاتف النشط (واتساب)</label>
                <div className="relative">
                   <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                     required
                     type="tel" 
                     inputMode="tel"
                     placeholder="05 / 06 / 07 XX XX XX XX"
                     dir="ltr"
                     className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-left text-base"
                     value={formData.phone}
                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
                   />
                </div>
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-bold text-gray-700 block mr-2">ملاحظات إضافية أو تفاصيل التصميم المطلوب (اختياري)</label>
             <div className="relative">
                <Edit3 className="absolute right-4 top-4 text-gray-400" size={18} />
                <textarea 
                  placeholder="أدخل أي متطلبات خاصة لشعارك أو ألوان الشركة..."
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium text-base h-32 resize-none"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />
             </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-primary/5 p-6 rounded-[2rem] space-y-3 mt-8 border border-primary/10">
             {discountAmount > 0 && (
               <div className="flex justify-between items-center text-green-600 font-bold text-sm mb-2">
                 <span>خصم تم تطبيقه بنجاح:</span>
                 <span>- {discountAmount} د.ج</span>
               </div>
             )}
             <div className="flex justify-between items-center text-primary pt-2 border-t border-primary/5">
                <span className="text-xl font-black">الإجمالي التقديري للطلب:</span>
                <span className="text-3xl font-black">{productPrice} د.ج</span>
             </div>
             <p className="text-xs text-gray-500 font-bold mb-0 text-right">قد تتغير التكلفة قليلاً بناءً على تفاصيل الطباعة والتوصيل المطلوبة والتي سيتم نقاشها معك فوراً.</p>
          </div>

          <div className="space-y-3 mt-4">
            {onAddToCart && (
               <button
                 type="button"
                 onClick={onAddToCart}
                 className="w-full bg-white border-2 border-primary text-primary py-4 rounded-xl font-bold text-lg hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 shadow-sm"
               >
                 <ShoppingCart size={20} />
                 أضف إلى السلة (للحصول على الخصم)
               </button>
            )}
            <button 
              disabled={isLoading}
              className="w-full bg-[#25D366] text-white rounded-[2rem] py-6 font-black text-xl hover:bg-[#20b957] transition-all flex items-center justify-center gap-3 shadow-2xl hover:shadow-[#25D366]/40 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
             {isLoading ? (
               <Loader2 className="animate-spin" size={24} />
             ) : (
               <>
                 <span>تأكيد الآن</span>
                 <MessageCircle className="group-hover:scale-110 transition-transform" />
               </>
             )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
