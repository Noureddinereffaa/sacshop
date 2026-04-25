"use client";

import { motion } from "framer-motion";
import { Tag, Crown, Gift, ArrowLeft, ShoppingBag, Percent, Star, Zap, Clock, CheckCircle2, DollarSign, Loader2, Flame, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";

export default function OffersPage() {
  const { discountConfig } = useCartStore();
  const { largeOrderCta, branding, popup } = useSettingsStore();
  const [vipOffers, setVipOffers] = useState<any[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) { setIsLoading(false); return; }
      
      // Fetch VIP offers
      const { data: offersData } = await supabase.from("vip_offers")
        .select("*")
        .eq("is_active", true)
        .order("min_orders", { ascending: true });
      
      const validOffers = (offersData || []).filter(o => !o.expires_at || new Date(o.expires_at) > new Date());
      setVipOffers(validOffers);

      // Fetch products with discounts (compare_price > price)
      const { data: productsData } = await supabase.from("products")
        .select("*")
        .eq("is_published", true)
        .not("compare_price", "is", null)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });
      
      // Filter products where compare_price is actually higher than price
      const withDiscount = (productsData || []).filter(p => p.compare_price && p.compare_price > p.price);
      setDiscountedProducts(withDiscount);

      setIsLoading(false);
    }
    fetchData();
  }, []);

  // Random selection of 3 or 6 discounted products
  const randomDiscounted = useMemo(() => {
    if (discountedProducts.length <= 3) return discountedProducts;
    const shuffled = [...discountedProducts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, discountedProducts.length >= 6 ? 6 : 3);
  }, [discountedProducts]);

  const hasWelcomeDiscount = discountConfig.enabled;
  const hasVipOffers = vipOffers.length > 0;
  const hasDiscountedProducts = randomDiscounted.length > 0;
  const { percentage, discountType, minItems } = discountConfig;

  const showCta = largeOrderCta?.enabled !== false;

  return (
    <main className="min-h-screen bg-gray-50/50 pt-12">
      
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100 py-20 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -ml-32 -mb-32" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest mb-6"
          >
            <Zap size={14} className="animate-pulse" />
            حصراً لزبائن {branding.storeName}
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-6xl font-black text-gray-950 mb-6"
          >
             عروض <span className="text-primary italic">VIP</span> وتخفيضات حصرية 🎁
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto font-medium"
          >
            نحن نقدر ولاءكم! اكتشف قائمة العروض المخصصة. وفر أكثر عند كل طلبية واحصل على مزايا استثنائية.
          </motion.p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16 space-y-24">
        
        {/* ═══════════════════════════════════════════════════ */}
        {/* Popup Content as a Post / Banner                  */}
        {/* ═══════════════════════════════════════════════════ */}
        {popup?.enabled && popup?.image && (
          <section className="max-w-4xl mx-auto">
            <Link href={popup.buttonLink || "/products"} className="flex flex-col group relative rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white animate-in fade-in zoom-in duration-700 bg-white">
               <div className="w-full relative flex justify-center bg-gray-50 overflow-hidden">
                 <img 
                   src={popup.image} 
                   alt={popup.title || "عرض حصري"}
                   className="w-full h-auto max-h-[75vh] object-contain group-hover:scale-[1.02] transition-transform duration-700"
                 />
               </div>
               <div className="p-6 sm:p-8 flex justify-center bg-white border-t border-gray-100 relative z-10">
                 <button className="bg-primary text-white px-10 sm:px-16 py-4 sm:py-5 rounded-2xl font-black text-lg sm:text-xl transition-all shadow-xl shadow-primary/20 flex items-center gap-3 group-hover:-translate-y-1">
                   {popup.buttonText || "اطلب الآن"} <ArrowLeft size={24} className="group-hover:-translate-x-2 transition-transform" />
                 </button>
               </div>
            </Link>
          </section>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-primary" size={48} />
            <p className="text-gray-500 font-bold">جاري تحميل العروض...</p>
          </div>
        ) : (!hasWelcomeDiscount && !hasVipOffers && !hasDiscountedProducts) ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-xl max-w-3xl mx-auto px-6">
             <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                <Clock size={48} />
             </div>
             <h2 className="text-3xl font-black text-gray-900 mb-4">ترقبوا عروضنا القادمة!</h2>
             <p className="text-gray-500 font-medium mb-8 text-lg">نحن نعمل باستمرار على تجهيز أفضل العروض والخصومات لكم. عودوا لزيارة هذه الصفحة قريباً لاكتشاف المفاجآت.</p>
             <Link href="/products">
                <button className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                   تصفح تشكيلة المنتجات
                </button>
             </Link>
          </div>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════ */}
            {/* Welcome Discount Section (only when enabled)      */}
            {/* ═══════════════════════════════════════════════════ */}
            {hasWelcomeDiscount && (
              <section>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
                  <div className="lg:col-span-1 space-y-6 text-right">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
                      <Percent size={32} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 leading-tight">العرض الترحيبي للزبائن الجدد</h2>
                    <p className="text-gray-500 font-medium leading-relaxed">اطلب أكثر، وفر أكثر! انضم إلى عائلتنا اليوم واستفد من خصم مباشر عند إضافة {minItems} منتجات أو أكثر إلى سلتك.</p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                        <CheckCircle2 size={18} className="text-green-500" />
                        <span>تفعيل تلقائي في السلة عند أول طلب</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-bold text-gray-700">
                        <CheckCircle2 size={18} className="text-green-500" />
                        <span>الخصم يعتمد على المنتجات المختارة</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <motion.div 
                      whileHover={{ y: -10 }}
                      className="bg-gradient-to-br from-primary to-primary/80 rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-primary/30 relative overflow-hidden group border-4 border-white/20"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform duration-1000" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                          <div className="text-white text-center md:text-right space-y-6">
                              <div className="inline-block bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 text-xs font-black">العرض الأكثر طلباً 🔥</div>
                              <h3 className="text-5xl md:text-7xl font-black leading-none">
                                {discountType === 'percentage' ? `خصم ${percentage}%` : `خصم ${percentage} د.ج`}
                              </h3>
                              <p className="text-white/80 text-xl font-bold">للمنتجات الأساسية كحد أدنى عند اختيار {minItems} منتجات</p>
                              <Link href="/products" className="inline-block">
                                <button className="bg-white text-primary px-12 py-5 rounded-2xl font-black text-xl hover:bg-gray-50 transition-all shadow-2xl flex items-center gap-3 mt-4 group">
                                  تسوق المنتجات الآن <ArrowLeft size={22} className="group-hover:-translate-x-2 transition-transform" />
                                </button>
                              </Link>
                          </div>
                          <div className="flex-shrink-0 animate-bounce-slow">
                              <div className="w-48 h-48 bg-white/10 backdrop-blur-3xl rounded-[3rem] items-center justify-center flex border-2 border-white/20 shadow-inner">
                                <Gift size={80} className="text-white " />
                              </div>
                          </div>
                        </div>
                    </motion.div>
                  </div>
                </div>
              </section>
            )}

            {/* ═══════════════════════════════════════════════════ */}
            {/* Discounted Products (Random Selection)            */}
            {/* ═══════════════════════════════════════════════════ */}
            {hasDiscountedProducts && (
              <section className="space-y-12 pt-12 border-t border-gray-100">
                <div className="text-center space-y-3">
                   <motion.div 
                     initial={{ opacity: 0, y: 10 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest"
                   >
                     <Flame size={14} />
                     صفقات لا تُفوَّت
                   </motion.div>
                   <h2 className="text-3xl font-black text-gray-950">مختارات مخفضة لك 🔥</h2>
                   <p className="text-gray-500 font-bold">منتجات عليها تخفيضات حقيقية — اغتنم الفرصة قبل نفاذها!</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {randomDiscounted.map((product, idx) => {
                    const saving = (product.compare_price || 0) - product.price;
                    const savingPercent = product.compare_price ? Math.round((saving / product.compare_price) * 100) : 0;
                    
                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Link href={`/products/${product.id}`} className="block group">
                          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-lg hover:shadow-2xl transition-all overflow-hidden relative h-full flex flex-col">
                            {/* Discount Badge */}
                            <div className="absolute top-5 right-5 z-10 flex flex-col gap-2">
                              <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg shadow-red-500/30 flex items-center gap-1">
                                <Sparkles size={12} />
                                وفر {savingPercent}%
                              </span>
                            </div>

                            {/* Product Image */}
                            <div className="aspect-[4/3] relative overflow-hidden bg-gray-50">
                              <Image
                                src={product.image_url || "/placeholder.png"}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Product Info */}
                            <div className="p-6 flex flex-col flex-grow">
                              <h3 className="text-lg font-black text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
                              {product.short_description && (
                                <p className="text-sm text-gray-500 font-medium mb-4 line-clamp-2">{product.short_description}</p>
                              )}
                              <div className="mt-auto flex items-end justify-between pt-4 border-t border-gray-50">
                                <div className="flex flex-col">
                                  <span className="text-gray-400 text-sm font-bold line-through">{product.compare_price?.toLocaleString()} د.ج</span>
                                  <span className="text-2xl font-black text-primary">{product.price.toLocaleString()} د.ج</span>
                                </div>
                                <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-xl text-xs font-black border border-red-100">
                                  - {saving.toLocaleString()} د.ج
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {discountedProducts.length > 3 && (
                  <div className="text-center pt-4">
                    <Link href="/products">
                      <button className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-black transition-all shadow-xl flex items-center gap-3 mx-auto">
                        عرض كافة المنتجات المخفضة <ArrowLeft size={18} />
                      </button>
                    </Link>
                  </div>
                )}
              </section>
            )}

            {/* ═══════════════════════════════════════════════════ */}
            {/* VIP Offers section                                */}
            {/* ═══════════════════════════════════════════════════ */}
            {hasVipOffers && (
              <section className="space-y-12 pt-12 border-t border-gray-100">
                <div className="text-center space-y-3">
                    <h2 className="text-3xl font-black text-gray-950">نظام النجوم VIP 🌟</h2>
                    <p className="text-gray-500 font-bold">عروض حصرية للزبائن الدائمين حسب رتبتهم</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {vipOffers.map((offer) => (
                    <div key={offer.id} className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all group overflow-hidden relative flex flex-col h-full">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform" />
                        <div className="relative z-10 flex-grow flex flex-col">
                          <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 mb-6">
                              {offer.discount_type === 'percentage' ? <Percent size={32} /> : <DollarSign size={32} />}
                          </div>
                          <h3 className="text-2xl font-black text-gray-900 mb-2">{offer.title}</h3>
                          <p className="text-primary font-bold text-sm mb-4">
                            يتطلب: {offer.min_orders === 0 ? "متوفر لجميع زبائننا" : `${offer.min_orders} طلبات سابقة (${offer.min_orders} نجوم)`}
                          </p>
                          <p className="text-gray-500 font-medium mb-8 leading-relaxed flex-grow">{offer.description}</p>
                          <Link href="/account" className="mt-auto flex items-center justify-between bg-yellow-50 p-4 rounded-3xl group-hover:bg-yellow-600 transition-colors">
                              <span className="text-yellow-700 font-bold group-hover:text-white">تفقد رتبتك الآن</span>
                              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-yellow-600 shadow-sm border border-yellow-100">
                                <ArrowLeft size={18} />
                              </div>
                          </Link>
                        </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </>
        )}

        {/* ═══════════════════════════════════════════════════ */}
        {/* Large Order CTA (Dynamic from Settings)           */}
        {/* ═══════════════════════════════════════════════════ */}
        {showCta && (
          <section className="bg-gray-950 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent pointer-events-none" />
             <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                <h2 className="text-3xl md:text-5xl font-black">{largeOrderCta?.title || "هل لديك طلبية كبيرة جداً؟"}</h2>
                <p className="text-white/60 text-lg font-medium">{largeOrderCta?.description || "إذا كنت تمثل علامة تجارية أو تبحث عن أسعار المصنع للكميات التي تتجاوز 10,000 قطعة، تواصل معنا مباشرة للحصول على عرض سعر مخصص."}</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                   <Link href={largeOrderCta?.button1Link || "https://wa.me/213"} target="_blank" className="w-full sm:w-auto">
                      <button className="w-full px-10 py-5 bg-[#25D366] text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-green-600 transition-all shadow-xl shadow-green-600/20">
                         <WhatsAppIcon size={24} /> {largeOrderCta?.button1Text || "تحدث مع مدير المبيعات"}
                      </button>
                   </Link>
                   <Link href={largeOrderCta?.button2Link || "/products"} className="w-full sm:w-auto">
                      <button className="w-full px-10 py-5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all border border-white/10">{largeOrderCta?.button2Text || "مشاهدة كافة الأسعار"}</button>
                   </Link>
                </div>
             </div>
          </section>
        )}

      </div>

    </main>
  );
}

function WhatsAppIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 1 1-7.6-11.7.2.2 0 0 1 .1 0z" />
      <path d="M7 11h.01" />
      <path d="M11 13h.01" />
      <path d="M15 11h.01" />
    </svg>
  );
}
