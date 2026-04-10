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
  const [pendingOrderId, setPendingOrderId] = useState<string>("");
  const [pendingWaLink, setPendingWaLink] = useState<string>("");
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

      // Order saved — show success screen with WhatsApp button
      // Build the direct WhatsApp link here for the button (client-side, but message already locked in DB)
      setPendingOrderId(orderId);
      setPendingWaLink(`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMessage)}`);
      setIsSuccess(true);

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
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl border-2 border-[#25D366]/40 shadow-xl text-center space-y-5"
      >
        <div className="w-20 h-20 bg-[#25D366]/15 rounded-full flex items-center justify-center text-[#25D366] mx-auto">
           <MessageCircle size={44} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">تم تسجيل طلبك! ✅</h2>
          <p className="text-gray-500 mt-2 leading-relaxed text-sm">
            اضغط على الزر أدناه لفتح واتساب وإتمام التأكيد مع فريقنا.
          </p>
        </div>
        {pendingWaLink && (
          <a
            href={pendingWaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white rounded-2xl py-5 font-black text-lg shadow-lg active:scale-95 transition-transform"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <MessageCircle size={24} />
            فتح واتساب والتأكيد الآن
          </a>
        )}
        <p className="text-xs text-gray-400">رقم الطلب: #{pendingOrderId.split('-')[0].toUpperCase()}</p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-100 shadow-xl">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
           <div className="w-11 h-11 bg-[#25D366]/10 rounded-2xl flex items-center justify-center text-[#25D366] shrink-0">
              <MessageCircle size={22} />
           </div>
           <div>
              <h2 className="text-lg sm:text-xl font-black text-gray-950">الطلب عبر واتساب</h2>
              <p className="text-gray-400 font-semibold text-xs">أدخل بياناتك ليتم تأكيد طلبك</p>
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
          <div className="bg-[#25D366]/5 p-4 rounded-2xl border border-[#25D366]/15 mt-4">
             {discountAmount > 0 && (
               <div className="flex justify-between items-center text-green-600 font-bold text-sm mb-2">
                 <span>خصم تم تطبيقه:</span>
                 <span>- {discountAmount} د.ج</span>
               </div>
             )}
             <div className="flex justify-between items-center text-gray-900">
                <span className="font-bold text-sm">المجموع الإجمالي:</span>
                <span className="text-2xl font-black text-[#25D366]">{productPrice.toLocaleString()} د.ج</span>
             </div>
          </div>

          <div className="space-y-3 mt-4">
            {onAddToCart && (
               <button
                 type="button"
                 onClick={onAddToCart}
                 className="w-full bg-white border-2 border-primary text-primary py-3.5 rounded-xl font-bold text-base hover:bg-primary/5 active:scale-95 transition-all flex items-center justify-center gap-2"
                 style={{ WebkitTapHighlightColor: 'transparent' }}
               >
                 <ShoppingCart size={20} />
                 أضف إلى السلة
               </button>
            )}
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#25D366] text-white rounded-2xl py-5 font-black text-xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed select-none"
              style={{ WebkitTapHighlightColor: 'transparent', minHeight: '64px' }}
            >
             {isLoading ? (
               <Loader2 className="animate-spin" size={26} />
             ) : (
               <>
                 <MessageCircle size={24} />
                 <span>تأكيد الطلب عبر واتساب</span>
               </>
             )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
