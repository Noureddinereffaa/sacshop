"use client";

import { useCartStore } from "@/store/cartStore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderForm from "@/components/OrderForm";
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, getCartTotal, getDiscountInfo, clearCart, updateQuantity, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
             <ShoppingBag size={48} className="text-gray-300" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">السلة فارغة</h1>
          <p className="text-gray-500 mb-8">لم تقم بإضافة أي منتجات إلى السلة بعد.</p>
          <Link href="/products">
            <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2">
               العودة للمتجر <ArrowRight size={20} />
            </button>
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const { isEligible, subtotal, discountAmount, finalTotal } = getDiscountInfo();

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <div className="container mx-auto px-4 py-8 md:py-12 flex-1">
        <div className="flex items-center gap-2 mb-8">
           <Link href="/products" className="text-gray-400 hover:text-primary transition-colors flex items-center gap-1 font-bold text-sm">
              <ArrowRight size={16} /> متابعة التسوق
           </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="text-primary" size={32} />
          إتمام الطلب
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Order Summary (Items) */}
          <div className="lg:col-span-5 space-y-6 lg:order-2">
             <div className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
                <h3 className="font-black text-xl text-gray-900 mb-6 border-b border-gray-100 pb-4">ملخص الطلب ({items.length})</h3>
                
                <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-2xl">
                      <div className="w-16 h-16 bg-white rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-100">
                        {item.image_url ? (
                          <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-200"><ShoppingBag size={20} /></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start gap-2">
                           <h4 className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight">{item.name}</h4>
                           <button 
                             onClick={() => removeItem(item.id)}
                             className="text-gray-400 hover:text-red-500 w-8 h-8 flex items-center justify-center rounded-full hover:bg-red-50 transition-all -m-1 shrink-0"
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                        <div className="flex gap-2 mt-1 text-xs text-gray-500 font-medium">
                          {item.size && <span>{item.size}</span>}
                          {item.size && item.color && <span>-</span>}
                          {item.color && <span>{item.color}</span>}
                        </div>
                        <div className="flex justify-between items-center mt-3">
                           <span className="font-black text-primary">{item.price} د.ج</span>
                           
                           <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-0.5 shadow-sm">
                             <button 
                               onClick={() => updateQuantity(item.id, item.quantity - 1)}
                               className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-primary transition-colors disabled:opacity-50"
                               disabled={item.quantity <= 1}
                             >
                               <Minus size={14} />
                             </button>
                             <input
                               type="number"
                               min="1"
                               dir="ltr"
                               inputMode="numeric"
                               value={item.quantity}
                               onChange={(e) => updateQuantity(item.id, Math.max(1, parseInt(e.target.value) || 1))}
                               className="w-10 text-center font-black text-sm bg-transparent border-none focus:ring-0 outline-none appearance-none p-0"
                             />
                             <button 
                               onClick={() => updateQuantity(item.id, item.quantity + 1)}
                               className="w-7 h-7 flex items-center justify-center text-gray-600 hover:text-primary transition-colors"
                             >
                               <Plus size={14} />
                             </button>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 space-y-2">
                   {isEligible && (
                     <div className="flex justify-between items-center text-green-600 font-bold text-sm">
                        <span>خصم سلة المشتريات (10%):</span>
                        <span>- {discountAmount} د.ج</span>
                     </div>
                   )}
                   <div className="flex justify-between items-center text-primary pt-2 border-t border-primary/10">
                      <span className="font-bold">المجموع الفرعي للإجمالي:</span>
                      <span className="text-xl font-black">{finalTotal} د.ج</span>
                   </div>
                </div>
             </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-7 lg:order-1">
            <div onClick={() => {
              // This is a small hack to clear cart if order succeeds.
              // OrderForm handles success naturally. In a real complex app we'd pass an onSuccess callback.
              const observer = new MutationObserver((mutations) => {
                 for (const m of mutations) {
                    if (m.target.textContent?.includes("توجيهك إلى الواتساب")) {
                       clearCart();
                       observer.disconnect();
                    }
                 }
              });
              observer.observe(document.body, { childList: true, subtree: true });
            }}>
              <OrderForm 
                productId="cart-order" // Placeholder
                productName="طلب متعدد (سلة)"
                productPrice={finalTotal}
                cartItems={items}
                discountAmount={discountAmount}
              />
            </div>
          </div>

        </div>
      </div>
      
      <Footer />
    </main>
  );
}
