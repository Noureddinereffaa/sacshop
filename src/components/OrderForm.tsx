"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, User, Truck, CheckCircle2, Loader2 } from "lucide-react";

interface Wilaya {
  id: number;
  name: string;
  name_ar: string;
}

interface OrderFormProps {
  productId: string;
  productName: string;
  productPrice: number;
  selectedSize?: string;
  selectedColor?: string;
  quantity?: number;
  appliedOfferId?: string;
}

export default function OrderForm({ productId, productName, productPrice, selectedSize, selectedColor, quantity = 1, appliedOfferId }: OrderFormProps) {
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [selectedWilaya, setSelectedWilaya] = useState<number | "">("");
  const [deliveryType, setDeliveryType] = useState<"home" | "desk">("home");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  useEffect(() => {
    async function fetchWilayas() {
      if (!supabase) return;
      const { data } = await supabase.from("wilayas").select("*").order("id");
      if (data) setWilayas(data);
    }
    fetchWilayas();
  }, []);

  useEffect(() => {
    if (selectedWilaya) {
      async function fetchFee() {
        if (!supabase) {
          setDeliveryFee(deliveryType === "home" ? 600 : 400);
          return;
        }
        const { data } = await supabase
          .from("delivery_fees")
          .select("*")
          .eq("wilaya_id", selectedWilaya)
          .single();
        
        if (data) {
          setDeliveryFee(deliveryType === "home" ? data.home_fee : data.desk_fee);
        } else {
          setDeliveryFee(deliveryType === "home" ? 600 : 400); 
        }
      }
      fetchFee();
    }
  }, [selectedWilaya, deliveryType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!supabase) throw new Error('Supabase not configured');

      const { data, error } = await supabase.from("orders").insert({
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_address: formData.address,
        wilaya_id: selectedWilaya,
        product_id: productId,
        quantity,
        size: selectedSize,
        color: selectedColor,
        product_price: productPrice,
        delivery_fee: deliveryFee,
        total_price: productPrice + deliveryFee,
        applied_offer_id: appliedOfferId || null,
        status: "new",
        delivery_type: deliveryType,
        customer_email: formData.email || null,
      }).select("id").single();

      if (error) throw error;
      
      // إرسال إشعار الإيمايل عبر API
      if (formData.email) {
        try {
          await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: data?.id || "N/A",
              customerName: formData.name,
              customerEmail: formData.email,
              status: "new",
              totalPrice: productPrice + deliveryFee,
            })
          });
        } catch (e) {
          console.error("Failed to send email notification", e);
        }
      }

      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-12 rounded-[3rem] border-2 border-primary/20 shadow-2xl text-center space-y-6"
      >
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-8">
           <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-black text-gray-900">تم استلام طلبك بنجاح!</h2>
        <p className="text-gray-500 text-lg leading-relaxed max-w-md mx-auto">
           شكراً لك {formData.name}. سنتواصل معك هاتفياً قريباً لتأكيد طلبك وتحديد موعد التسليم.
        </p>
        <div className="pt-8">
           <button 
             onClick={() => window.location.href = "/"}
             className="bg-gray-900 text-white px-12 py-4 rounded-2xl font-bold hover:bg-primary transition-all"
           >
              العودة للرئيسية
           </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-gray-100 shadow-2xl relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
           <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Truck size={24} />
           </div>
           <div>
              <h2 className="text-2xl font-black text-gray-950">معلومات التوصيل</h2>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-tighter">أدخل بياناتك لإتمام الطلب</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block mr-2">الاسم الكامل</label>
                <div className="relative">
                   <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                     required
                     type="text" 
                     placeholder="مثلاً: محمد الجزائري"
                     className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                   />
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block mr-2">رقم الهاتف</label>
                <div className="relative">
                   <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                   <input 
                     required
                     type="tel" 
                     placeholder="05 / 06 / 07 XX XX XX XX"
                     dir="ltr"
                     className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-right"
                     value={formData.phone}
                     onChange={(e) => setFormData({...formData, phone: e.target.value})}
                   />
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block mr-2">الولاية</label>
                <select 
                  required
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium appearance-none"
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(Number(e.target.value))}
                >
                   <option value="">اختر ولايتك...</option>
                   {wilayas.map((w) => (
                     <option key={w.id} value={w.id}>{w.id} - {w.name_ar}</option>
                   ))}
                </select>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block mr-2">نوع التوصيل</label>
                <div className="flex gap-4">
                   <button 
                     type="button"
                     className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${deliveryType === "home" ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                     onClick={() => setDeliveryType("home")}
                   >
                      <span>للمنزل</span>
                   </button>
                   <button 
                     type="button"
                     className={`flex-1 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${deliveryType === "desk" ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                     onClick={() => setDeliveryType("desk")}
                   >
                      <span>للمكتب</span>
                   </button>
                </div>
             </div>
          </div>

          <div className="space-y-2">
             <label className="text-sm font-bold text-gray-700 block mr-2">العنوان الكامل</label>
             <div className="relative">
                <MapPin className="absolute right-4 top-4 text-gray-400" size={18} />
                <textarea 
                  required
                  placeholder="أدخل عنوان السكن بالتفصيل..."
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium h-32 resize-none"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
             </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-primary/5 p-6 rounded-[2rem] space-y-3 mt-8 border border-primary/10">
             <div className="flex justify-between items-center text-gray-600">
                <span className="font-bold">سعر المنتج:</span>
                <span className="font-black">{productPrice} د.ج</span>
             </div>
             <div className="flex justify-between items-center text-gray-600">
                <span className="font-bold">سعر التوصيل:</span>
                <span className="font-black">{deliveryFee} د.ج</span>
             </div>
             <div className="h-px bg-primary/20 my-2" />
             <div className="flex justify-between items-center text-primary">
                <span className="text-xl font-black">الإجمالي:</span>
                <span className="text-3xl font-black">{productPrice + deliveryFee} د.ج</span>
             </div>
          </div>

          <button 
            disabled={isLoading}
            className="w-full bg-gray-950 text-white rounded-[2rem] py-6 font-black text-xl hover:bg-primary transition-all flex items-center justify-center gap-3 shadow-2xl hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
             {isLoading ? (
               <Loader2 className="animate-spin" size={24} />
             ) : (
               <>
                 <span>تأكيد الطلب الآن</span>
                 <CheckCircle2 size={24} className="group-hover:scale-110 transition-transform" />
               </>
             )}
          </button>
          
          <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-tight">
             الدفع يكون عند الاستلام (COD)
          </p>
        </form>
      </div>
    </div>
  );
}
