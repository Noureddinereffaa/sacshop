import Hero from "@/components/Hero";
import Partners from "@/components/Partners";

import { ArrowRight, ShoppingBag, Truck, ShieldCheck, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

// Use ISR: Cache the page and regenerate every 60 seconds to slash TTFB server delay.
export const revalidate = 60; 

export default async function Home() {
  const { data: rawProducts } = supabase 
    ? await supabase.from("products").select("*").eq("is_published", true).eq("is_featured", true).limit(6)
    : { data: null };

  const products = rawProducts && rawProducts.length > 0 ? rawProducts : [
    { id: "1", name: "أكياس ورقية كرافت (Kraft Bags)", price: 35.00, image_url: "https://placehold.co/800x800/d2b48c/ffffff.png?text=Kraft+Bag", category: "أكياس ورقية" },
    { id: "2", name: "أكياس فاخرة مغلفة", price: 120.00, image_url: "https://placehold.co/800x800/1a1a1a/ffffff.png?text=Luxury+Bag", category: "أكياس فاخرة" },
    { id: "3", name: "علب شحن وتوصيل", price: 65.00, image_url: "https://placehold.co/800x800/c4a484/1a1a1a.png?text=Shipping+Box", category: "علب وتعبئة" },
  ];

  // Fetch discount settings
  let discountEnabled = true; // Default to true as per cartStore
  let discountPercentage = 10;
  if (supabase) {
     const { data: offerSetting } = await supabase.from("settings").select("value").eq("key", "discounts").maybeSingle();
     if (offerSetting && offerSetting.value) {
       discountEnabled = offerSetting.value.newCustomerDiscountEnabled !== false;
       discountPercentage = offerSetting.value.newCustomerDiscountPercent || 10;
     }
  }
  return (
    <main className="min-h-screen">
      <Hero />
      <Partners />

      {/* Value Proposition Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover-lift text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                <Truck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">توصيل 58 ولاية</h3>
              <p className="text-gray-500 text-sm leading-relaxed">توصيل سريع ومضمون إلى باب منزلك أو لمكتب التوصيل في جميع ولايات الجزائر.</p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover-lift text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">ضمان الجودة</h3>
              <p className="text-gray-500 text-sm leading-relaxed">جميع أكياسنا مصنوعة من أجود الخامات الورقية والقماشية الصديقة للبيئة.</p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover-lift text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">طلب سريع بـ 3 نقرات</h3>
              <p className="text-gray-500 text-sm leading-relaxed">نظام طلب مخصص للسوق الجزائري يضمن لك الحصول على طلبك في ثوانٍ.</p>
            </div>

            <div className="p-8 rounded-3xl bg-gray-50 border border-gray-100 hover-lift text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                <ShoppingBag size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">أفضل الأسعار</h3>
              <p className="text-gray-500 text-sm leading-relaxed">نقدم أسعاراً تنافسية جداً للجملة والتجزئة مع تخفيضات دائمة.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Sneak Peek */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
            <div className="text-right">
               <h2 className="text-4xl font-black text-gray-900 mb-4">أكياسنا الأكثر مبيعاً</h2>
               <p className="text-gray-500 text-lg">اكتشف تشكيلتنا الواسعة من الأكياس ذات الجودة العالية</p>
            </div>
            <Link href="/products" className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all group">
               <span>مشاهدة كل المنتجات</span>
               <ArrowRight size={20} className="rotate-180" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {products.map((p) => (
               <ProductCard
                 key={p.id}
                 product={p as any}
               />
             ))}
          </div>
        </div>
      </section>

    </main>
  );
}
