"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import OrderForm from "@/components/OrderForm";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useCartStore } from "@/store/cartStore";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import {
  Star, ShieldCheck, Truck, RefreshCcw, ChevronRight,
  CheckCircle2, Package, Zap
} from "lucide-react";
import { motion } from "framer-motion";

interface Product {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  compare_price: number | null;
  image_url: string;
  gallery: string[];
  category: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
}

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
  colors: [],
  stock: 10000,
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [discountConfig, setDiscountConfig] = useState({ enabled: true, percentage: 10 });
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [showToast, setShowToast] = useState(false);
  const { addItem } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    async function fetchProduct() {
      if (!supabase || !id) {
        setProduct(DEMO_PRODUCT);
        setIsLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .single();

      // Fetch promo settings
      const { data: offerSetting } = await supabase.from("settings").select("value").eq("key", "offers").maybeSingle();
      if (offerSetting && offerSetting.value) {
        setDiscountConfig({
          enabled: offerSetting.value.cartDiscountEnabled !== false,
          percentage: offerSetting.value.cartDiscountPercentage || 10
        });
      }

      setProduct(error || !data ? DEMO_PRODUCT : data);
      setIsLoading(false);
    }
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-gray-500 font-bold">جاري تحميل المنتج...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
        <div>
          <Package size={64} className="text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-700 mb-2">المنتج غير موجود</h1>
          <Link href="/products" className="text-primary font-bold hover:underline">العودة للمنتجات</Link>
        </div>
      </main>
    );
  }

  const allImages = [product.image_url, ...(product.gallery || [])].filter(Boolean);
  const effectivePrice = product.price;
  const discountPercent = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      productId: product.id,
      name: product.name,
      price: effectivePrice,
      quantity: 1,
      image_url: product.image_url,
      size: selectedSize || undefined,
      color: selectedColor || undefined
    });
    router.push("/products");
  };

  return (
    <main className="min-h-screen bg-gray-50/50">
      <Header />
      
      {/* Promotional Banner */}
      {discountConfig.enabled && (
        <div className="bg-gradient-to-l from-primary to-primary/80 text-white shadow-xl shadow-primary/20 relative z-10 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="container mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row items-center justify-center gap-3 relative z-20">
             <div className="flex items-center gap-3 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 shadow-inner">
               <Zap size={18} className="text-yellow-300 animate-pulse" fill="currentColor" />
               <span className="font-black text-sm tracking-wide">حدث حصري للشركات (B2B)</span>
             </div>
             <p className="font-bold text-sm md:text-base text-center">
                احصل على تخفيض فوري بقيمة <span className="text-yellow-300 font-black text-lg mx-1">{discountConfig.percentage}%</span> عند إضافة <span className="underline underline-offset-4 font-black">منتجين أو أكثر</span> إلى سلة التسوق!
             </p>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500 text-right">
          <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ChevronRight size={14} className="rotate-180" />
          <Link href="/products" className="hover:text-primary transition-colors">المنتجات</Link>
          <ChevronRight size={14} className="rotate-180" />
          <span className="text-gray-900 font-bold">{product.name}</span>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: showToast ? 1 : 0, y: showToast ? 0 : -50 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
        <div className="bg-gray-900/90 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 backdrop-blur-md border border-gray-700">
           <CheckCircle2 className="text-[#25D366]" size={20} />
           تمت إضافة المنتج إلى السلة بنجاح
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* ==================== LEFT: Images ==================== */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl relative"
            >
              {allImages[selectedImage] ? (
                <Image
                  src={allImages[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <Package size={80} />
                </div>
              )}
              {discountPercent > 0 && (
                <div className="absolute top-5 right-5 bg-red-500 text-white text-sm font-black px-4 py-2 rounded-2xl shadow-lg">
                  -{discountPercent}%
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 snap-start w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all relative ${
                      selectedImage === i ? "border-primary shadow-lg shadow-primary/20" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ==================== RIGHT: Info + Form ==================== */}
          <div className="space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <div className="flex text-yellow-400 gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  <span className="text-gray-400 text-sm font-bold mr-2">(120+ تقييم)</span>
                </div>
                <span className="text-primary text-xs font-black bg-primary/10 px-3 py-1.5 rounded-full uppercase tracking-wide">
                  {product.category}
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl font-black text-gray-950 leading-tight mb-2">{product.name}</h1>
                {product.short_description && (
                  <p className="text-gray-500 font-medium">{product.short_description}</p>
                )}
              </div>

              {/* Price */}
              <div className="flex items-end gap-4">
                <span className="text-4xl font-black text-gray-950">
                  {effectivePrice.toLocaleString()} <span className="text-xl text-primary">د.ج</span>
                </span>
                {product.compare_price && (
                  <span className="text-xl text-gray-400 line-through mb-1">
                    {product.compare_price.toLocaleString()} د.ج
                  </span>
                )}
              </div>

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                    المقاس
                    {selectedSize && <span className="text-primary font-bold">({selectedSize})</span>}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size === selectedSize ? "" : size)}
                        className={`px-5 py-2.5 rounded-xl font-bold border-2 transition-all ${
                          selectedSize === size
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                    اللون
                    {selectedColor && <span className="text-primary font-bold">({selectedColor})</span>}
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {product.colors.map(color => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name === selectedColor ? "" : color.name)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                          selectedColor === color.name
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        title={color.name}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-gray-200 shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-sm text-gray-700">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { icon: Truck, text: "توصيل 58 ولاية" },
                  { icon: RefreshCcw, text: "ضمان الاستبدال" },
                  { icon: ShieldCheck, text: "دفع آمن عند الاستلام" },
                  { icon: CheckCircle2, text: "جودة مضمونة 100%" },
                ].map(badge => (
                  <div key={badge.text} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
                    <badge.icon size={16} className="text-primary shrink-0" />
                    <span className="text-xs font-bold text-gray-600">{badge.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                <h3 className="font-black text-gray-900 mb-3 text-lg">وصف المنتج</h3>
                <p className="text-gray-600 leading-loose">{product.description}</p>
              </div>
            )}

            {/* Add to Cart & Order Actions */}
            <div className="space-y-4">
              <OrderForm
                productId={product.id}
                productName={product.name}
                productPrice={effectivePrice}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onAddToCart={handleAddToCart}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
