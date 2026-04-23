"use client";

import { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";
import { Search, Filter, Loader2, Gift, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import Link from "next/link";

// Fallback static products when Supabase not connected
const STATIC_PRODUCTS: Product[] = [
  { id: "1", name: "أكياس ورقية كرافت (Kraft Bags)", price: 35.00, image_url: "https://placehold.co/800x800/d2b48c/ffffff.png?text=Kraft+Bag", category: "أكياس ورقية", description: "", short_description: "", compare_price: null, sizes: [], colors: [], stock: 0, is_published: true, is_featured: false },
  { id: "2", name: "أكياس فاخرة مغلفة", price: 120.00, image_url: "https://placehold.co/800x800/1a1a1a/ffffff.png?text=Luxury+Bag", category: "أكياس فاخرة", description: "", short_description: "", compare_price: null, sizes: [], colors: [], stock: 0, is_published: true, is_featured: false },
  { id: "3", name: "أكياس بلاستيكية مطبوعة", price: 15.00, image_url: "https://placehold.co/800x800/e8e8e8/1a1a1a.png?text=Plastic+Bag", category: "أكياس بلاستيكية", description: "", short_description: "", compare_price: null, sizes: [], colors: [], stock: 0, is_published: true, is_featured: false },
  { id: "4", name: "ورق تغليف داخلي", price: 8.00, image_url: "https://placehold.co/800x800/f8f9fa/1a1a1a.png?text=Tissue+Paper", category: "ملحقات التغليف", description: "", short_description: "", compare_price: null, sizes: [], colors: [], stock: 0, is_published: true, is_featured: false },
  { id: "5", name: "ملصقات وشعارات دائرية", price: 4.00, image_url: "https://placehold.co/800x800/10a37f/ffffff.png?text=Stickers", category: "ملحقات التغليف", description: "", short_description: "", compare_price: null, sizes: [], colors: [], stock: 0, is_published: true, is_featured: false },
  { id: "6", name: "علب شحن وتوصيل", price: 65.00, image_url: "https://placehold.co/800x800/c4a484/1a1a1a.png?text=Shipping+Box", category: "علب وتعبئة", description: "", short_description: "", compare_price: null, sizes: [], colors: [], stock: 0, is_published: true, is_featured: false },
];

function ProductsList() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category");
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");
  
  const { items, getDiscountInfo, customerStatus, appliedVipOffer, discountConfig } = useCartStore();
  const { isEligible, percentage } = getDiscountInfo();
  const { navigation } = useSettingsStore();

  const [mounted, setMounted] = useState(false);

  // Derive categories from navigation settings
  const dynamicCategories = ["الكل", ...(navigation || []).map(item => item.label)];
  if (urlCategory && !dynamicCategories.includes(urlCategory)) {
    dynamicCategories.push(urlCategory);
  }
  
  useEffect(() => {
    setMounted(true);
    if (urlCategory) {
      setActiveCategory(urlCategory);
    } else {
      setActiveCategory("الكل");
    }
  }, [urlCategory]);

  useEffect(() => {
    async function fetchProducts() {
      if (!supabase) {
        setProducts(STATIC_PRODUCTS);
        setFiltered(STATIC_PRODUCTS);
        setIsLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      
      const result = (error || !data || data.length === 0) ? STATIC_PRODUCTS : data;
      setProducts(result);
      setFiltered(result);
      setIsLoading(false);
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;
    if (activeCategory !== "الكل") {
      result = result.filter(p => p.category?.split(",").map(c => c.trim()).includes(activeCategory));
    }
    if (search.trim()) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [search, activeCategory, products]);

  return (
    <>
      {/* Hero Banner */}
      <section className="bg-white border-b border-gray-100 py-14">
        <div className="container mx-auto px-4 text-right">
          <p className="text-primary font-bold text-sm uppercase tracking-widest mb-3">تشكيلة واسعة</p>
          <h1 className="text-4xl lg:text-5xl font-black text-gray-950 mb-4">
            جميع <span className="text-primary">منتجاتنا</span>
          </h1>
          <p className="text-gray-500 text-lg">اختر من بين أفضل حلول التغليف والطباعة</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* UPSell Banner B2B logic (only when discount enabled or VIP) */}
        {mounted && items.length > 0 && (isEligible || (customerStatus !== 'vip' && discountConfig.enabled)) && (
          <div className={`mb-10 p-6 rounded-3xl border-2 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl transition-all ${
            isEligible 
              ? "bg-green-50 border-green-200 text-green-800" 
              : "bg-primary/5 border-primary/20 text-primary"
          }`}>
             <div className="flex items-center gap-4">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                 isEligible ? "bg-green-200 text-green-700 shadow-inner" : "bg-primary shadow-xl shadow-primary/20 text-white"
               }`}>
                 {isEligible ? <CheckCircle2 size={32} /> : <Gift size={32} />}
               </div>
               <div>
                 <h3 className="text-xl font-black mb-1">
                   {isEligible 
                     ? (customerStatus === 'vip' 
                        ? `خصم حصري: ${appliedVipOffer?.title} 👏`
                        : "مبروك! الخصم الترحيبي مُفعّل في سلتك 👏")
                     : `خصم ${percentage}% بانتظارك!`}
                 </h3>
                 <p className={`font-bold text-sm ${isEligible ? "text-green-700/80" : "text-gray-500"}`}>
                   {isEligible 
                     ? "يمكنك الاستمرار في التسوق أو إتمام طلبك الآن بالأسعار المخفضة." 
                     : `لقد أضفت منتجاً، أضف منتجاً آخر لسلّتك الآن للحصول على خصم ${percentage}% المباشر!`}
                 </p>
               </div>
             </div>
             <Link href="/checkout" className="w-full sm:w-auto">
               <button className={`w-full px-8 py-4 rounded-xl font-black flex items-center justify-center gap-2 transition-all ${
                 isEligible 
                   ? "bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-600/20" 
                   : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
               }`}>
                 الذهاب للدفع <ArrowLeft size={18} />
               </button>
             </Link>
          </div>
        )}

        {/* Search + Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={18} className="text-gray-400 shrink-0" />
            {dynamicCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="animate-spin text-primary" size={40} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 text-gray-400">
            <p className="text-2xl font-bold mb-2">لا توجد نتائج</p>
            <p>جرب بحثاً آخر أو اختر تصنيفاً مختلفاً</p>
          </div>
        ) : (
          <>
            <p className="text-gray-400 text-sm font-bold mb-6 text-right">{filtered.length} منتج</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(product => (
                <ProductCard
                  key={product.id}
                  product={product as Product}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <main className="min-h-screen bg-gray-50/50 pt-8">
      <Suspense fallback={
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      }>
        <ProductsList />
      </Suspense>
    </main>
  );
}
