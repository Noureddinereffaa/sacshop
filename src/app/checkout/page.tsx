"use client";

import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderForm from "@/components/OrderForm";
import { ShoppingBag, ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, Star, Crown } from "lucide-react";

export default function CheckoutPage() {
  const { branding } = useSettingsStore();
  const { 
    items, 
    customerStatus,
    appliedVipOffer,
    setCustomerStatus,
    setAppliedVipOffer,
    setDiscountConfig,
    getCartTotal, 
    getDiscountInfo, 
    clearCart, 
    updateQuantity, 
    removeItem 
  } = useCartStore();
  
  const [mounted, setMounted] = useState(false);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [availableOffers, setAvailableOffers] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    checkEligibility();
    
    // Track InitiateCheckout
    try {
      const items = useCartStore.getState().items;
      const total = useCartStore.getState().getCartTotal();
      window.trackMarketingEvent?.("InitiateCheckout", {
        value: total,
        currency: "DZD",
        num_items: items.length,
        content_ids: items.map(i => i.productId)
      });
    } catch { /* non-critical */ }
  }, []);

  async function checkEligibility() {
    const phone = sessionStorage.getItem("servseri_phone");
    if (!phone) {
      setCustomerStatus('guest'); // Fallback to guest if not logged in
      return;
    }

    setIsLoadingOffers(true);
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      
      if (data.customer) {
        // Determine status based on order count (0 = new, >=1 = vip)
        const status = (data.customer.total_orders || 0) === 0 ? 'new' : 'vip';
        setCustomerStatus(status);
        
        if (data.discountConfig) {
          setDiscountConfig({
            enabled: data.discountConfig.newCustomerDiscountEnabled,
            percentage: data.discountConfig.newCustomerDiscountPercent,
            minItems: data.discountConfig.newCustomerMinItems,
          });
        }

        if (status === 'vip' && data.vipOffers) {
          setAvailableOffers(data.vipOffers);
          // Auto-select best offer if none set
          if (!appliedVipOffer && data.vipOffers.length > 0) {
            setAppliedVipOffer(data.vipOffers[0]);
          }
        }
      } else {
        setCustomerStatus('new'); // Treat unknown phone as new
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingOffers(false);
    }
  }

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-transparent flex flex-col pt-8">
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
      </main>
    );
  }

  const { isEligible, discountType, subtotal, discountAmount, finalTotal, label } = getDiscountInfo();

  return (
    <main className="min-h-screen bg-transparent flex flex-col pt-8">
      
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
             <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl relative overflow-hidden">
                {/* Brand watermark */}
                <div className="absolute -left-10 -top-10 opacity-[0.03] w-64 h-64 pointer-events-none">
                   <Image src="/brand/logo-mark.png" alt="watermark" fill className="object-contain" />
                </div>
                
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-6 relative z-10">
                   <div className="text-right">
                     <h3 className="font-black text-2xl text-gray-900">فاتورة الطلب</h3>
                     <p className="text-gray-400 text-xs font-bold mt-1">عدد العناصر: {items.length}</p>
                   </div>
                   <div className="relative w-28 h-10 sm:w-36 sm:h-12 hidden xs:block">
                      <Image src={branding?.logo || "/brand/logo-horizontal-1.png"} alt="Brand" fill className="object-contain object-left" />
                   </div>
                </div>
                
                <div className="relative z-10 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 mb-6">
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

                {/* Discount Applied */}
                {isEligible && (
                  <div className="flex justify-between items-center text-green-600 font-bold mb-4 bg-green-50 p-4 rounded-2xl border border-green-100 animate-in zoom-in-95">
                     <div className="flex items-center gap-2">
                        <Tag size={20} />
                        <div className="flex flex-col">
                           <span className="text-sm">{label}</span>
                           <span className="text-[10px] opacity-70">تم التطبيق تلقائياً</span>
                        </div>
                     </div>
                     <span>-{discountAmount.toLocaleString()} د.ج</span>
                  </div>
                )}

                {/* VIP Offer Selector for Returning Customers */}
                {customerStatus === 'vip' && availableOffers.length > 1 && (
                  <div className="mb-6 space-y-3">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">تغيير العرض المطبق</p>
                    <div className="flex flex-wrap gap-2">
                      {availableOffers.map(offer => (
                         <button
                           key={offer.id}
                           onClick={() => setAppliedVipOffer(offer)}
                           className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${appliedVipOffer?.id === offer.id ? "bg-primary border-primary text-white shadow-lg" : "bg-white border-gray-100 text-gray-500 hover:border-gray-300"}`}
                         >
                           {offer.title}
                         </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                     <span className="text-gray-900 font-black text-xl">المجموع النهائي</span>
                     <span className="text-3xl font-black text-primary">{finalTotal.toLocaleString()} د.ج</span>
                  </div>
                  
                  {/* Progress Indicator Context */}
                  {customerStatus === 'new' && !isEligible && (
                     <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 mb-6 flex items-center gap-3">
                        <Star className="text-yellow-600 fill-yellow-600" size={16} />
                        <span className="text-[10px] font-bold text-yellow-800">
                          أضف {useCartStore.getState().discountConfig.minItems} منتجات أو أكثر للحصول على خصم الترحيب ({useCartStore.getState().discountConfig.percentage}%)!
                        </span>
                     </div>
                  )}
                </div>
             </div>
             
             <div className="bg-primary/5 p-6 rounded-[2rem] border border-primary/10">
                <div className="flex gap-4">
                   <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      <Star className="text-primary fill-primary" size={20} />
                   </div>
                   <div>
                      <p className="font-black text-primary text-sm">هدية مع كل طلب!</p>
                      <p className="text-primary/70 text-[10px] font-bold leading-relaxed">
                        كلما زادت طلباتك، زاد عدد نجومك ⭐ وتفتحت لك عروض أقوى في "نادي VIP" الخاص بنا.
                      </p>
                   </div>
                </div>
             </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-7 lg:order-1">
             <OrderForm 
               productId="cart-order" 
               productName="طلب متعدد (سلة)"
               productPrice={finalTotal}
               appliedOfferId={appliedVipOffer?.id}
               cartItems={items}
               discountAmount={discountAmount}
             />
          </div>

        </div>
      </div>
      
      <Footer />
    </main>
  );
}
