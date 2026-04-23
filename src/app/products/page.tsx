import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import { Loader2 } from "lucide-react";
import ProductsClient from "./ProductsClient";

// Fallback static products when Supabase not connected
const STATIC_PRODUCTS: Product[] = [
  { id: "1", name: "أكياس ورقية كرافت (Kraft Bags)", price: 35.00, image_url: "https://placehold.co/800x800/d2b48c/ffffff.png?text=Kraft+Bag", category: "أكياس ورقية", description: "", short_description: "", compare_price: null, sizes: [], colors: [], stock: 0, is_published: true, is_featured: false },
  { id: "2", name: "أكياس فاخرة مغلفة", price: 120.00, image_url: "https://placehold.co/800x800/1a1a1a/ffffff.png?text=Luxury+Bag", category: "أكياس فاخرة", description: "", short_description: "", compare_price: null, sizes: [], colors: [], stock: 0, is_published: true, is_featured: false },
  { id: "3", name: "أكياس بلاستيكية مطبوعة", price: 15.00, image_url: "https://placehold.co/800x800/e8e8e8/1a1a1a.png?text=Plastic+Bag", category: "أكياس بلاستيكية", description: "", short_description: "", compare_price: null, sizes: [], colors: [], stock: 0, is_published: true, is_featured: false },
  { id: "4", name: "ورق تغليف داخلي", price: 8.00, image_url: "https://placehold.co/800x800/f8f9fa/1a1a1a.png?text=Tissue+Paper", category: "ملحقات التغليف", description: "", short_description: "", compare_price: null, sizes: [], colors: [], stock: 0, is_published: true, is_featured: false },
  { id: "5", name: "ملصقات وشعارات دائرية", price: 4.00, image_url: "https://placehold.co/800x800/10a37f/ffffff.png?text=Stickers", category: "ملحقات التغليف", description: "", short_description: "", compare_price: null, sizes: [], colors: [], stock: 0, is_published: true, is_featured: false },
  { id: "6", name: "علب شحن وتوصيل", price: 65.00, image_url: "https://placehold.co/800x800/c4a484/1a1a1a.png?text=Shipping+Box", category: "علب وتعبئة", description: "", short_description: "", compare_price: null, sizes: [], colors: [], stock: 0, is_published: true, is_featured: false },
];

async function getProducts() {
  if (!supabase) return STATIC_PRODUCTS;
  
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  
  if (error || !data || data.length === 0) return STATIC_PRODUCTS;
  return data as Product[];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-gray-50/50 pt-8">
      <Suspense fallback={
        <div className="flex items-center justify-center py-32">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      }>
        <ProductsClient initialProducts={products} />
      </Suspense>
    </main>
  );
}
