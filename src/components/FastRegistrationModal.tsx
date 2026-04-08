"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Crown, Phone, Mail, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Wilaya {
  id: number;
  name_ar: string;
}

export default function FastRegistrationModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    wilaya_id: "",
  });

  useEffect(() => {
    async function fetchWilayas() {
      if (!supabase) return;
      const { data } = await supabase.from("wilayas").select("id, name_ar").order("id");
      if (data) setWilayas(data);
    }
    if (isOpen && wilayas.length === 0) fetchWilayas();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!supabase) throw new Error("Supabase is missing");

      // Check if user already exists
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("phone", formData.phone)
        .single();

      if (existing) {
        // Just update email/wilaya if they already exist
        await supabase.from("customers").update({
          email: formData.email || null,
          wilaya_id: parseInt(formData.wilaya_id)
        }).eq("id", existing.id);
      } else {
        // Create new customer
        await supabase.from("customers").insert({
          name: formData.name,
          phone: formData.phone,
          email: formData.email || null,
          wilaya_id: parseInt(formData.wilaya_id),
          is_vip: false, // will become VIP after orders
        });
      }

      setIsSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsSuccess(false);
        setFormData({ name: "", phone: "", email: "", wilaya_id: "" });
      }, 3000);

    } catch (error) {
      console.error(error);
      alert("حدث خطأ اثناء التسجيل. الرجاء المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 px-4 py-2 rounded-xl font-bold transition-colors border border-yellow-200 shadow-sm"
      >
        <Crown size={18} className="text-yellow-500" />
        <span>انضم للـ VIP</span>
      </button>

      {/* Mobile button variant could be added here if needed */}

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg relative z-10 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setIsOpen(false)}
                className="absolute top-6 left-6 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 mx-auto mb-4">
                  <Crown size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">تسجيل سريع لتخفيضات VIP</h2>
                <p className="text-gray-500 text-sm">سجل بياناتك مرة واحدة لتحصل على عروضنا الحصرية وتسريع عملية الطلب مستقبلاً.</p>
              </div>

              {isSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <CheckCircle2 size={64} className="text-green-500 mx-auto" />
                  <h3 className="text-2xl font-black text-gray-900">تم التسجيل بنجاح!</h3>
                  <p className="text-gray-500">مرحباً بك في عائلة SacShop. ترقب أحدث العروض على إيميلك.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <UserPlus className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      required
                      type="text" 
                      placeholder="الاسم الكامل"
                      className="w-full bg-gray-50 border-none rounded-xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-yellow-500/20 outline-none font-medium text-right"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      required
                      type="tel" 
                      dir="ltr"
                      placeholder="رقم الهاتف (مثال: 0555000000)"
                      className="w-full bg-gray-50 border-none rounded-xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-yellow-500/20 outline-none font-medium text-right"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="email" 
                      dir="ltr"
                      placeholder="البريد الإلكتروني (اختياري - للعروض)"
                      className="w-full bg-gray-50 border-none rounded-xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-yellow-500/20 outline-none font-medium text-right"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                      required
                      className="w-full bg-gray-50 border-none rounded-xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-yellow-500/20 outline-none font-medium appearance-none"
                      value={formData.wilaya_id}
                      onChange={(e) => setFormData({...formData, wilaya_id: e.target.value})}
                    >
                      <option value="">اختر ولايتك...</option>
                      {wilayas.map((w) => (
                        <option key={w.id} value={w.id}>{w.id} - {w.name_ar}</option>
                      ))}
                    </select>
                  </div>

                  <button 
                    disabled={isLoading}
                    className="w-full bg-gray-900 text-white rounded-xl py-4 font-black mt-2 hover:bg-primary transition-all flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? <Loader2 className="animate-spin" /> : (
                      <>
                        <span>الانضمام الآن</span>
                        <Crown size={18} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
