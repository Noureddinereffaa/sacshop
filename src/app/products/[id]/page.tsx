import { Metadata, ResolvingMetadata } from 'next';
import { getSupabase } from "@/lib/supabase";
import ProductClient from "./ProductClient";
import { Product } from "@/types";

export const revalidate = 60;

type Props = {
  params: Promise<{ id: string }>
};

// Fallback for demo when Supabase not connected
const DEMO_PRODUCT: Product = {
  id: "1",
  name: "أكياس ورقية كرافت (Kraft Bags)",
  description: "أكياس الكرافت البنية الكلاسيكية هي الخيار الأمثل للعلامات التجارية التي تبحث عن المظهر الطبيعي والبيئي. تتميز بقوة تحمل عالية وتناسب محلات الملابس، الوجبات السريعة، والمقاهي. السعر المعروض هو للقطعة الواحدة (الحد الأدنى للطلب يحدد في المراسلة).",
  short_description: "صديقة للبيئة مع طباعة الشعار بلون أو لونين.",
  price: 35.00,
  compare_price: 45.00,
  image_url: "https://placehold.co/800x800/d2b48c/ffffff.png?text=Kraft+Bag",
  gallery: [
    "https://placehold.co/800x800/d2b48c/000000.png?text=Kraft+Bag+Back",
  ],
  category: "أكياس ورقية",
  sizes: ["صغير", "متوسط", "كبير"],
  colors: [] as { name: string; hex: string }[],
  stock: 10000,
  is_published: true,
  is_featured: false,
};

// 🚀 Pre-generate all product pages at build time (SSG) → 0ms TTFB
export async function generateStaticParams() {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data } = await supabase
    .from("products")
    .select("id")
    .eq("is_published", true);

  return (data || []).map((p: { id: string }) => ({ id: p.id }));
}

// Single DB fetch reused by both metadata and page render
async function getProduct(id: string): Promise<Product | null> {
  const supabase = getSupabase();
  if (!supabase || !id) return null;

  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  return data || null;
}

// Dynamic Metadata Generation for SEO
export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: DEMO_PRODUCT.name,
      description: DEMO_PRODUCT.short_description,
    };
  }

  return {
    title: `${product.name} | Service Serigraphie`,
    description: product.short_description || product.description?.slice(0, 150),
    metadataBase: new URL("https://serviceserigraphie.com"),
    openGraph: {
      title: product.name,
      description: product.short_description || product.description?.slice(0, 150),
      images: [product.image_url],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.short_description || product.description?.slice(0, 150),
      images: [product.image_url],
    }
  };
}

// Server Component for fast initial load
export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  const initialProduct = product || DEMO_PRODUCT;

  return <ProductClient initialProduct={initialProduct} />;
}
