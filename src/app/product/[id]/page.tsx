"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import OrderForm from "@/components/OrderForm";
import VipOfferChecker from "@/components/VipOfferChecker";
import WhatsAppButton from "@/components/WhatsAppButton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import {
  Star, ShieldCheck, Truck, RefreshCcw, ChevronRight,
  Minus, Plus, Tag, CheckCircle2, Package
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
  name: "حقيبة تسوق كلاسيكية فاخرة",
  description: "حقيبة مصنوعة من أجود أنواع الجلد الطبيعي، تتميز بتصميم أنيق وعملي يناسب جميع المناسبات. تأتي بخياطة محكمة ومقاومة للاستخدام اليومي.",
  short_description: "جلد طبيعي عالي الجودة - ضمان سنة",
  price: 3500,
  compare_price: 5000,
  image_url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1000",
  gallery: [
    "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
  ],
  category: "حقائب جلدية",
  sizes: ["صغير", "متوسط", "كبير"],
  colors: [{ name: "بني", hex: "#8B4513" }, { name: "أسود", hex: "#1a1a1a" }, { name: "بيج", hex: "#D2B48C" }],
  stock: 15,
};

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [appliedOffer, setAppliedOffer] = useState<{ id: string; title: string; discount_type: string; discount_value: number } | null>(null);
  const [discountedPrice, setDiscountedPrice] = useState<number | null>(null);

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
  const effectivePrice = discountedPrice ?? product.price;
  const discountPercent = product.compare_price
    ? Math.round((1 - product.price / product.compare_price) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-gray-50/50">
      <Header />
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
              {discountPercent > 0 && !appliedOffer && (
                <div className="absolute top-5 right-5 bg-red-500 text-white text-sm font-black px-4 py-2 rounded-2xl shadow-lg">
                  -{discountPercent}%
                </div>
              )}
              {appliedOffer && (
                <div className="absolute top-5 right-5 bg-primary text-white text-sm font-black px-4 py-2 rounded-2xl shadow-lg flex items-center gap-1.5">
                  <Tag size={14} />
                  عرض حصري
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all relative ${
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
                <span className={`text-4xl font-black ${appliedOffer ? "text-primary" : "text-gray-950"}`}>
                  {effectivePrice.toLocaleString()} <span className="text-xl text-primary">د.ج</span>
                </span>
                {product.compare_price && !appliedOffer && (
                  <span className="text-xl text-gray-400 line-through mb-1">
                    {product.compare_price.toLocaleString()} د.ج
                  </span>
                )}
                {appliedOffer && (
                  <span className="text-lg text-gray-400 line-through mb-1">
                    {product.price.toLocaleString()} د.ج
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

              {/* Quantity */}
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-700">الكمية</label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="text-2xl font-black text-gray-900 w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                  <span className="text-xs text-gray-400 font-bold">{product.stock} متاح في المخزن</span>
                </div>
              </div>

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

            {/* VIP Offer Checker */}
            <VipOfferChecker
              productPrice={product.price * quantity}
              onOfferApplied={(offer, finalPrice) => {
                setAppliedOffer(offer as typeof appliedOffer);
                setDiscountedPrice(finalPrice);
              }}
              onOfferRemoved={() => {
                setAppliedOffer(null);
                setDiscountedPrice(null);
              }}
            />

            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                <h3 className="font-black text-gray-900 mb-3 text-lg">وصف المنتج</h3>
                <p className="text-gray-600 leading-loose">{product.description}</p>
              </div>
            )}

            {/* Order Form */}
            <OrderForm
              productId={product.id}
              productName={product.name}
              productPrice={effectivePrice * quantity}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              quantity={quantity}
              appliedOfferId={appliedOffer?.id}
            />
          </div>
        </div>
      </div>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
