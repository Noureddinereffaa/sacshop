"use client";

import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderForm from "@/components/OrderForm";
import { ShoppingBag, ArrowRight, Trash2 } from "lucide-react";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Tag, Star, Crown, Ticket, X, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function CheckoutPage() {
  const { branding } = useSettingsStore();
  const { 
    items, 
    customerStatus,
    appliedVipOffer,
    appliedCoupon,
    setCustomerStatus,
    setAppliedVipOffer,
    setAppliedCoupon,
    setDiscountConfig,
    getCartTotal, 
    getDiscountInfo, 
    clearCart, 
    removeItem 
  } = useCartStore();
  
  const [mounted, setMounted] = useState(false);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [availableOffers, setAvailableOffers] = useState<any[]>([]);
  const [couponInput, setCouponInput] = useState("");
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponJustApplied, setCouponJustApplied] = useState(false);
  const lastCartSignature = useRef("");

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
                    discountType: data.discountConfig.newCustomerDiscountType || 'percentage',
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

  async function applyCoupon(code: string) {
    const trimmed = code.trim();
    if (!trimmed) return;
    setIsCheckingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: trimmed,
          cart: items.map(i => ({ productId: i.productId, price: i.price, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!data.valid) {
        setCouponError(data.error || "الكوبون غير صالح");
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({
        id: data.coupon.id,
        code: data.coupon.code,
        discount_type: data.coupon.discount_type,
        discount_value: data.coupon.discount_value,
        max_discount_amount: data.coupon.max_discount_amount,
      });
      setCouponInput("");
      setCouponJustApplied(true);
      setTimeout(() => setCouponJustApplied(false), 2500);
    } catch (err) {
      console.error("Error validating coupon:", err);
      setCouponError("حدث خطأ أثناء التحقق من الكوبون");
    } finally {
      setIsCheckingCoupon(false);
    }
  }

  // Revalidate the applied coupon whenever the cart changes
  useEffect(() => {
    if (!mounted || !appliedCoupon) return;
    const signature = items.map(i => `${i.productId}:${i.price}:${i.quantity}`).join("|");
    if (signature === lastCartSignature.current) return;
    lastCartSignature.current = signature;
    if (items.length === 0) {
      setAppliedCoupon(null);
      return;
    }
    (async () => {
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: appliedCoupon.code,
            cart: items.map(i => ({ productId: i.productId, price: i.price, quantity: i.quantity })),
          }),
        });
        const data = await res.json();
        if (!data.valid) {
          setAppliedCoupon(null);
          setCouponError(data.error || "لم يعد الكوبون صالحًا على سلتك الحالية");
        }
      } catch { /* keep coupon on transient network errors */ }
    })();
  }, [items, mounted, appliedCoupon, setAppliedCoupon]);

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

  const { isEligible, discountType, subtotal, discountAmount, couponDiscount, finalTotal, label } = getDiscountInfo();

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
                   <OptimizedImage src="/favicon.png" alt="watermark" fill className="object-contain" />
                </div>
                
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-6 relative z-10">
                   <div className="text-right">
                     <h3 className="font-black text-2xl text-gray-900">فاتورة الطلب</h3>
                     <p className="text-gray-400 text-xs font-bold mt-1">عدد العناصر: {items.length}</p>
                   </div>
                   <div className="relative w-28 h-10 sm:w-36 sm:h-12 hidden xs:block">
                      {branding?.logo ? (
                         <OptimizedImage src={branding.logo} alt="Brand" fill className="object-contain object-left" />
                      ) : (
                         <div className="w-full h-full flex flex-col items-end justify-center">
                            <span className="font-black text-gray-900 text-sm">{branding?.storeName}</span>
                         </div>
                      )}
                   </div>
                </div>
                
                <div className="relative z-10 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-2xl">
                      <div className="w-16 h-16 bg-white rounded-xl overflow-hidden relative flex-shrink-0 border border-gray-100">
                        {item.image_url ? (
                          <OptimizedImage src={item.image_url} alt={item.name} fill className="object-cover" />
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
                           
                           <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-2 shadow-sm">
                             <span className="font-black text-sm text-gray-700">الكمية: {item.quantity}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Coupon Input */}
                <div className="mb-6 relative z-10">
                  {appliedCoupon ? (
                    <div className="flex justify-between items-center bg-primary/5 border border-primary/20 p-4 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <Ticket size={20} className="text-primary" />
                        <div className="flex flex-col">
                          <span className="font-black text-primary font-mono tracking-wider">{appliedCoupon.code}</span>
                          <span className="text-[10px] text-gray-500 font-bold">
                            {couponJustApplied ? "تم تطبيق الكوبون بنجاح ✓" : "كوبون الخصم مُطبّق"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => { setAppliedCoupon(null); setCouponError(""); }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        title="إزالة الكوبون"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Ticket size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={couponInput}
                            onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                            onKeyDown={e => { if (e.key === "Enter") applyCoupon(couponInput); }}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 outline-none font-mono font-black tracking-wider uppercase"
                            placeholder="أدخل كود الخصم"
                          />
                        </div>
                        <button
                          onClick={() => applyCoupon(couponInput)}
                          disabled={isCheckingCoupon || !couponInput.trim()}
                          className="bg-gray-900 text-white px-6 py-3 rounded-xl font-black hover:bg-gray-800 transition-all disabled:opacity-40 flex items-center gap-2 shrink-0"
                        >
                          {isCheckingCoupon ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                          تطبيق
                        </button>
                      </div>
                      {couponError && (
                        <div className="flex items-center gap-2 text-red-500 text-xs font-bold mt-2 bg-red-50 p-3 rounded-xl">
                          <AlertCircle size={14} /> {couponError}
                        </div>
                      )}
                    </div>
                  )}
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

                {/* Coupon Applied */}
                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex justify-between items-center text-primary font-bold mb-4 bg-primary/5 p-4 rounded-2xl border border-primary/20">
                     <div className="flex items-center gap-2">
                        <Ticket size={20} />
                        <div className="flex flex-col">
                           <span className="text-sm">كوبون {appliedCoupon.code}</span>
                           <span className="text-[10px] opacity-70">
                             {appliedCoupon.discount_type === "percentage" ? `${appliedCoupon.discount_value}%` : "خصم مباشر"}
                           </span>
                        </div>
                     </div>
                     <span>-{couponDiscount.toLocaleString()} د.ج</span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  {(isEligible || (appliedCoupon && couponDiscount > 0)) && (
                    <div className="flex justify-between items-center text-gray-500 font-bold mb-2 text-sm">
                       <span>المجموع الفرعي</span>
                       <span>{subtotal.toLocaleString()} د.ج</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mb-6">
                     <span className="text-gray-900 font-black text-xl">المجموع النهائي</span>
                     <span className="text-3xl font-black text-primary">{finalTotal.toLocaleString()} د.ج</span>
                  </div>
                  
                  {/* Progress Indicator Context */}
                  {customerStatus === 'new' && !isEligible && useCartStore.getState().discountConfig.enabled && (
                     <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 mb-6 flex items-center gap-3">
                        <Star className="text-yellow-600 fill-yellow-600" size={16} />
                        <span className="text-[10px] font-bold text-yellow-800">
                          أضف {useCartStore.getState().discountConfig.minItems} منتجات أو أكثر للحصول على خصم الترحيب ({useCartStore.getState().discountConfig.discountType === 'percentage' ? `${useCartStore.getState().discountConfig.percentage}%` : `${useCartStore.getState().discountConfig.percentage} د.ج`})!
                        </span>
                     </div>
                  )}
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
               discountAmount={discountAmount + couponDiscount}
               couponCode={appliedCoupon?.code}
               appliedCouponId={appliedCoupon?.id}
             />
          </div>

        </div>
      </div>
      
      <Footer />
    </main>
  );
}
