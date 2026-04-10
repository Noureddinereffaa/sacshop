"use client";

import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { CartItem } from "@/types";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, getDiscountInfo, setDiscountConfig } = useCartStore();
  
  // Hydration & Settings Fetch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    
    async function fetchDiscountConfig() {
      if (!supabase) return;
      const { data } = await supabase.from("settings").select("value").eq("key", "offers").single();
      if (data && data.value) {
        setDiscountConfig(
          data.value.cartDiscountEnabled !== false, 
          data.value.cartDiscountPercentage || 10
        );
      }
    }
    fetchDiscountConfig();
  }, [setDiscountConfig]);

  if (!mounted) return null;

  const { isEligible, subtotal, discountAmount, finalTotal } = getDiscountInfo();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <ShoppingBag className="text-primary" />
                سلة المشتريات
              </h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-4">
              {/* Discount Promo Banner */}
              {items.length > 0 && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-colors ${
                  isEligible 
                   ? 'bg-green-50 border-green-200 text-green-800' 
                   : 'bg-primary/5 border-primary/20 text-primary'
                }`}>
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                     isEligible ? 'bg-green-200 text-green-700' : 'bg-primary/20 text-primary'
                   }`}>
                     <ShoppingBag size={20} />
                   </div>
                   <div>
                     <p className="font-black">خصم 10% على المجموع!</p>
                     <p className="text-xs font-bold opacity-80">
                       {isEligible 
                         ? 'مبروك! تم تفعيل الخصم 👏' 
                         : 'أضف منتجاً آخر لسلّتك لتفعيل الخصم المباشر.'}
                     </p>
                   </div>
                </div>
              )}
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
                    <ShoppingBag size={48} className="text-gray-300" />
                  </div>
                  <p className="font-bold text-lg">السلة فارغة حالياً</p>
                  <p className="text-sm">تصفح منتجاتنا وأضف ما يعجبك!</p>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="mt-4 px-6 py-2 bg-primary/10 text-primary font-bold rounded-xl hover:bg-primary/20 transition-colors"
                  >
                    متابعة التسوق
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item: CartItem) => (
                    <motion.div key={item.id} className="flex gap-4 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      {/* Image */}
                      <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden relative flex-shrink-0">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300"><ShoppingBag size={24} /></div>
                        )}
                      </div>
                      
                      {/* Info */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="font-bold text-gray-900 text-sm line-clamp-2">{item.name}</h3>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-gray-400 hover:text-red-500 w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-all -m-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                          
                          {/* Variants line */}
                          <div className="flex gap-2 mt-1 text-xs text-gray-500 font-medium">
                            {item.size && <span className="bg-gray-100 px-2 rounded-md">{item.size}</span>}
                            {item.color && (
                               <div className="flex items-center gap-1 bg-gray-100 px-2 rounded-md">
                                 <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color === 'أسود' ? '#000' : item.color === 'أبيض' ? '#fff' : item.color }}></span>
                                 {item.color}
                               </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <p className="font-black text-primary">{item.price} د.ج</p>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 bg-gray-50/80 rounded-xl p-1 border border-gray-200/60">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-primary hover:border-primary/20 border border-transparent transition-all cursor-pointer disabled:opacity-50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <input
                              type="number"
                              min="1"
                              dir="ltr"
                              inputMode="numeric"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                              className="w-10 sm:w-12 text-center font-black text-sm md:text-base bg-transparent border-none focus:ring-0 outline-none appearance-none"
                            />
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-gray-600 hover:text-primary hover:border-primary/20 border border-transparent transition-all cursor-pointer"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-6 pb-8 md:pb-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] sticky bottom-0 z-10 w-full">
                <div className="space-y-2 mb-4">
                  {isEligible && (
                    <div className="flex items-center justify-between text-green-600 text-sm font-bold">
                      <span>الخصم المكتسب (10%):</span>
                      <span>- {discountAmount} د.ج</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-gray-500 font-bold">الإجمالي للمنتجات:</span>
                    <span className="text-2xl font-black text-gray-900 leading-none">{finalTotal} د.ج</span>
                  </div>
                </div>
                {/* Notice that shipping is not included yet */}
                <p className="text-[11px] text-gray-400 font-medium text-center mb-4 leading-tight">هذا السعر مبدئي. يتم تحديد التكلفة النهائية والتوصيل بواسطة فريقنا.</p>
                
                <Link href="/checkout" onClick={() => setIsOpen(false)} className="block">
                   <button className="w-full bg-primary text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/25 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                     إكمال الطلب <ArrowRight size={22} className="opacity-90" />
                   </button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
