import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Partners from "@/components/Partners";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

export default async function Home() {
  const { data: rawProducts } = supabase 
    ? await supabase.from("products").select("*").eq("is_published", true).eq("is_featured", true).limit(6)
    : { data: null };

  const products = rawProducts && rawProducts.length > 0 ? rawProducts : [
    { id: "1", name: "حقيبة جلدية فاخرة", price: 4500, image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800", category: "حقائب جلدية" },
    { id: "2", name: "كيس ورقي أنيق", price: 1200, image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800", category: "أكياس ورقية" },
    { id: "3", name: "حقيبة تسوق يومية", price: 2800, image_url: "https://images.unsplash.com/photo-1601924921557-45e6dea0a157?auto=format&fit=crop&q=80&w=800", category: "حقائب قماشية" },
  ];
  return (
    <main className="min-h-screen">
      <Header />
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
            <button className="flex items-center gap-2 text-primary font-bold hover:gap-4 transition-all group">
               <span>مشاهدة كل المنتجات</span>
               <ArrowRight size={20} className="rotate-180" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {products.map((p) => (
               <ProductCard
                 key={p.id}
                 id={p.id}
                 name={p.name}
                 price={p.price}
                 image={p.image_url}
                 category={p.category}
               />
             ))}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
