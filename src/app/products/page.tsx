"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ProductCard from "@/components/ProductCard";
import { Search, Filter, Loader2 } from "lucide-react";


interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  description: string;
}

// Fallback static products when Supabase not connected
const STATIC_PRODUCTS: Product[] = [
  { id: "1", name: "حقيبة تسوق كلاسيكية", price: 3500, image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800", category: "حقائب جلدية", description: "" },
  { id: "2", name: "حقيبة قماشية صديقة للبيئة", price: 1800, image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800", category: "حقائب قماشية", description: "" },
  { id: "3", name: "حقيبة ظهر عصرية", price: 4500, image_url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800", category: "حقائب ظهر", description: "" },
  { id: "4", name: "كيس ورقي فاخر", price: 850, image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=800", category: "أكياس ورقية", description: "" },
  { id: "5", name: "حقيبة يد أنيقة", price: 5200, image_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800", category: "حقائب يد", description: "" },
  { id: "6", name: "كيس تسوق بيج", price: 1200, image_url: "https://images.unsplash.com/photo-1601924921557-45e6dea0a157?auto=format&fit=crop&q=80&w=800", category: "حقائب قماشية", description: "" },
];

const CATEGORIES = ["الكل", "حقائب جلدية", "حقائب قماشية", "حقائب ظهر", "أكياس ورقية", "حقائب يد"];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("الكل");

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
      result = result.filter(p => p.category === activeCategory);
    }
    if (search.trim()) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFiltered(result);
  }, [search, activeCategory, products]);

  return (
    <main className="min-h-screen bg-gray-50/50">
      <Header />
      {/* Hero Banner */}
      <section className="bg-white border-b border-gray-100 py-14">
        <div className="container mx-auto px-4 text-right">
          <p className="text-primary font-bold text-sm uppercase tracking-widest mb-3">تشكيلة واسعة</p>
          <h1 className="text-4xl lg:text-5xl font-black text-gray-950 mb-4">
            جميع <span className="text-primary">منتجاتنا</span>
          </h1>
          <p className="text-gray-500 text-lg">اختر من بين أفضل الحقائب والأكياس في الجزائر</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
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
            {CATEGORIES.map(cat => (
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
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image_url}
                  category={product.category}
                />
              ))}
            </div>
          </>
        )}
      </div>
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
