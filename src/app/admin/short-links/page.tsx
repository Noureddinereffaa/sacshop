"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import {
  Link2, Copy, Trash2, Search, Plus, ExternalLink,
  Loader2, CheckCircle2, TrendingUp, MousePointerClick,
  Package, Zap, Facebook, RefreshCw, X, Eye, Tags
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavigationItem {
  label: string;
  href: string;
}

interface ProductSummary {
  id: string;
  name: string;
  image_url: string;
  category: string;
  price: number;
  is_published: boolean;
}

type LinkType = "product" | "category";

interface ShortLink {
  id: string;
  slug: string;
  product_id: string;
  product_name: string;
  product_image?: string | null;
  destination: string;
  clicks: number;
  created_at: string;
  type: string;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (typeof window !== "undefined" && !window.location.origin.includes("localhost")
    ? window.location.origin
    : "https://serviceserigraphie.com");

// ─── Ultra-fast thumbnail component for popup images ───────────────────────
// Uses native <img> with decoding=async + fetchpriority=high for max speed.
// Avoids Next.js Image optimizer overhead for tiny 48×48 thumbnails.
function ProductThumb({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (!src || !src.startsWith("http") || error) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-300">
        <Package size={20} />
      </div>
    );
  }

  // Append width hint to Supabase/storage URLs to get the smallest possible image
  let optimizedSrc = src;
  try {
    const url = new URL(src);
    // Supabase storage transform
    if (url.hostname.includes("supabase") || url.pathname.includes("/storage/")) {
      url.searchParams.set("width", "96");
      url.searchParams.set("quality", "75");
      optimizedSrc = url.toString();
    }
  } catch {
    optimizedSrc = src;
  }

  return (
    <>
      {/* Skeleton shimmer */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse rounded-xl" />
      )}
      {/* Native img: fetchpriority=high + decoding=async = fastest possible */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={optimizedSrc}
        alt={alt}
        width={48}
        height={48}
        loading="eager"
        decoding="async"
        // @ts-expect-error fetchpriority is valid HTML attr not yet in TS types
        fetchpriority="high"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full h-full object-cover transition-opacity duration-150 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

// ─── Small thumbnail for the links table ───────────────────────────────────
function LinkThumb({ src, alt }: { src?: string; alt: string }) {
  const [error, setError] = useState(false);
  if (!src || error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Package size={16} className="text-gray-400" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={40}
      height={40}
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
      className="w-full h-full object-cover"
    />
  );
}

export default function ShortLinksPage() {
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isLoadingLinks, setIsLoadingLinks] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductSummary | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [linkType, setLinkType] = useState<LinkType>("product");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [categories, setCategories] = useState<NavigationItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NavigationItem | null>(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const preloadedRef = useRef(false);

  const fetchLinks = useCallback(async () => {
    setIsLoadingLinks(true);
    const res = await fetch("/api/short-links");
    const json = await res.json();
    setLinks(json.data || []);
    setIsLoadingLinks(false);
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      if (!supabase) { setIsLoadingProducts(false); return; }
      const { data } = await supabase
        .from("products")
        .select("id, name, image_url, category, price, is_published")
        .eq("is_published", true)
        .order("sort_order", { ascending: true, nullsFirst: false });
      setProducts(data || []);
      setIsLoadingProducts(false);

      // ── Preload the first 6 product images into browser cache ──
      // so when the popup opens, images are already in memory.
      if (!preloadedRef.current && data && data.length > 0) {
        preloadedRef.current = true;
        data.slice(0, 6).forEach((p: ProductSummary) => {
          if (p.image_url && p.image_url.startsWith("http")) {
            const link = document.createElement("link");
            link.rel = "preload";
            link.as = "image";
            link.href = p.image_url;
            document.head.appendChild(link);
          }
        });
      }
    }
    fetchProducts();
    fetchLinks();
  }, [fetchLinks]);

  // ── Fetch categories from navigation settings ───────────────────────────
  useEffect(() => {
    async function fetchCategories() {
      if (!supabase) { setIsLoadingCategories(false); return; }
      const { data } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "navigation")
        .maybeSingle();
      if (data?.value && Array.isArray(data.value)) {
        setCategories(data.value as NavigationItem[]);
      }
      setIsLoadingCategories(false);
    }
    fetchCategories();
  }, []);

  // ── When popup opens, preload remaining visible images ──────────────────
  useEffect(() => {
    if (!showProductPicker || products.length === 0) return;
    const visible = products.slice(0, 10);
    visible.forEach((p) => {
      if (p.image_url && p.image_url.startsWith("http")) {
        const img = new window.Image();
        img.src = p.image_url;
      }
    });
  }, [showProductPicker, products]);

  const filteredLinks = links.filter(l =>
    l.product_name.toLowerCase().includes(search.toLowerCase()) ||
    l.slug.includes(search.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredCategories = categories.filter(c =>
    c.label.toLowerCase().includes(categorySearch.toLowerCase())
  );

  async function createShortLink() {
    if (!selectedProduct) return;
    setIsCreating(true);
    const res = await fetch("/api/short-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        product_image: selectedProduct.image_url || null,
        type: "product",
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      alert("خطأ في إنشاء الرابط: " + (json.error || "حاول مرة أخرى"));
      setIsCreating(false);
      return;
    }
    await fetchLinks();
    setSelectedProduct(null);
    setShowProductPicker(false);
    setProductSearch("");
    setIsCreating(false);
  }

  // New function: fetch a product ID and image for a given category
  async function fetchCategoryProductInfo(categoryName: string): Promise<{ id: string; image_url: string } | null> {
    if (!supabase) return null;
    const { data } = await supabase
      .from("products")
      .select("id, image_url") // Select both ID and image_url
      .eq("is_published", true)
      .neq("image_url", "")
      .not("image_url", "is", null)
      .filter("category", "ilike", `%${categoryName}%`)
      .limit(1)
      .maybeSingle(); // Get a single product

    if (data && data.id && data.image_url) {
      return {
        id: data.id,
        image_url: data.image_url.replace(/^http:\/\//, "https://")
      };
    }
    return null;
  }

  async function createCategoryLink() {
    if (!selectedCategory) return;
    setIsCreating(true);
    const catName = selectedCategory.label.trim();
    
    // Fetch product ID and image
    const productInfo = await fetchCategoryProductInfo(catName);
    
    if (!productInfo) {
      alert(`لا يمكن إنشاء رابط تصنيف لـ "${catName}". لا يوجد منتج منشور ومرتبط بصورة في هذا التصنيف.`);
      setIsCreating(false);
      return;
    }

    const productId = productInfo.id;
    const image = productInfo.image_url;

    const res = await fetch("/api/short-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: productId, // Use the actual product ID
        product_name: catName,
        product_image: image,
        type: "category",
        category_name: catName,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      alert("خطأ في إنشاء الرابط: " + (json.error || "حاول مرة أخرى"));
      setIsCreating(false);
      return;
    }
    await fetchLinks();
    setSelectedCategory(null);
    setShowCategoryPicker(false);
    setCategorySearch("");
    setIsCreating(false);
  }

  async function deleteLink(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا الرابط؟")) return;
    setDeletingId(id);
    await fetch(`/api/short-links?id=${id}`, { method: "DELETE" });
    await fetchLinks();
    setDeletingId(null);
  }

  async function copyLink(slug: string, id: string) {
    const url = `${BASE_URL}/api/short-links/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  }

  function closeModal() {
    setShowProductPicker(false);
    setSelectedProduct(null);
    setProductSearch("");
  }

  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0);

  return (
    <div className="space-y-8 pb-20" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Facebook size={20} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900">روابط الإعلانات المختصرة</h1>
          </div>
          <p className="text-gray-500 mr-13">
            أنشئ روابط احترافية مختصرة من دومينك الخاص لاستخدامها في إعلانات فيسبوك
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          {/* Link Type Toggle */}
          <div className="bg-gray-100 rounded-xl p-1 flex self-stretch md:self-auto">
            <button
              onClick={() => setLinkType("product")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                linkType === "product"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Package size={16} className="inline-block ml-1.5" />
              منتج
            </button>
            <button
              onClick={() => setLinkType("category")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                linkType === "category"
                  ? "bg-white text-purple-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Link2 size={16} className="inline-block ml-1.5" />
              تصنيف
            </button>
          </div>
          <button
            onClick={() => {
              if (linkType === "category") {
                setShowCategoryPicker(true);
              } else {
                setShowProductPicker(true);
              }
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <Plus size={20} />
            إنشاء رابط {linkType === "category" ? "تصنيف" : "جديد"}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "إجمالي الروابط", value: links.length, icon: Link2, color: "bg-blue-50 text-blue-600" },
          { label: "إجمالي النقرات", value: totalClicks, icon: MousePointerClick, color: "bg-green-50 text-green-600" },
          { label: "أفضل رابط", value: links.length > 0 ? Math.max(...links.map(l => l.clicks)) : 0, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold mb-0.5">{s.label}</p>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-l from-blue-600 to-blue-700 rounded-2xl p-5 flex items-center gap-4 text-white">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Zap size={22} className="text-white" />
        </div>
        <div>
          <p className="font-black text-lg">صفحة هبوط احترافية + إعادة توجيه فورية</p>
          <p className="text-blue-100 text-sm mt-0.5">
            عند فتح الرابط من فيسبوك، تظهر صفحة هبوط احترافية بصورة المنتج وزرين &quot;الذهاب للموقع&quot; و&quot;العودة لفيسبوك&quot;
          </p>
        </div>
      </div>

      {/* Search + Refresh */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="البحث في الروابط..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium"
          />
        </div>
        <button
          onClick={fetchLinks}
          className="bg-white border border-gray-200 p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-500"
          title="تحديث"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Links Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        {isLoadingLinks ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Link2 size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold text-lg">لا توجد روابط مختصرة بعد</p>
            <p className="text-sm mt-1">اضغط على &quot;إنشاء رابط جديد&quot; لإنشاء أول رابط مختصر</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-5">المنتج</th>
                  <th className="px-6 py-5">النوع</th>
                  <th className="px-6 py-5">الرابط المختصر</th>
                  <th className="px-6 py-5 text-center">النقرات</th>
                  <th className="px-6 py-5">التاريخ</th>
                  <th className="px-6 py-5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {filteredLinks.map(link => {
                    const isCopied = copiedId === link.id;
                    const isDeleting = deletingId === link.id;
                    return (
                      <motion.tr
                        key={link.id}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        {/* Product */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0 overflow-hidden relative">
                              <LinkThumb src={link.product_image || undefined} alt={link.product_name} />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 line-clamp-1 text-sm">{link.product_name}</p>
                              <a
                                href={link.destination}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-gray-400 hover:text-blue-600 flex items-center gap-1 mt-0.5 transition-colors"
                              >
                                <ExternalLink size={10} />
                                عرض المنتج
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-black ${
                            link.type === "category"
                              ? "bg-purple-50 text-purple-700"
                              : "bg-blue-50 text-blue-700"
                          }`}>
                            {link.type === "category" ? "تصنيف" : "منتج"}
                          </span>
                        </td>

                        {/* Short URL */}
                        <td className="px-6 py-4">
                          <code className="bg-gray-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-tight max-w-[220px] truncate block">
                            /api/short-links/{link.slug}
                          </code>
                        </td>

                        {/* Clicks */}
                        <td className="px-6 py-4 text-center">
                          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-xl text-sm font-black">
                            <MousePointerClick size={14} />
                            {link.clicks}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="px-6 py-4 text-gray-400 text-xs font-bold">
                          {new Date(link.created_at).toLocaleDateString("ar-DZ", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={`/go/${link.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-purple-500 hover:bg-purple-50 rounded-xl transition-colors"
                              title="معاينة صفحة الهبوط"
                            >
                              <Eye size={16} />
                            </a>
                            <button
                              onClick={() => copyLink(link.slug, link.id)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all ${
                                isCopied
                                  ? "bg-green-500 text-white shadow-lg shadow-green-500/25"
                                  : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                              }`}
                            >
                              {isCopied ? (
                                <><CheckCircle2 size={14} /> تم النسخ!</>
                              ) : (
                                <><Copy size={14} /> نسخ الرابط</>
                              )}
                            </button>
                            <button
                              onClick={() => deleteLink(link.id)}
                              disabled={isDeleting}
                              className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors disabled:opacity-50"
                              title="حذف"
                            >
                              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Product Picker Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showProductPicker && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ type: "spring", bounce: 0.18, duration: 0.35 }}
              className="fixed inset-x-4 top-[4%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[560px] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[92vh] flex flex-col"
            >
              {/* ── Header ── */}
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-black text-gray-900">اختر منتجاً</h2>
                  <p className="text-gray-400 text-sm mt-0.5">سيتم إنشاء رابط مختصر لهذا المنتج</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              {/* ── Search bar ── */}
              <div className="px-4 py-3 border-b border-gray-50 shrink-0">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="ابحث عن منتج..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    autoFocus
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pr-9 pl-4 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium"
                  />
                  {productSearch && (
                    <button
                      onClick={() => setProductSearch("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* ── Product grid ── */}
              <div className="overflow-y-auto flex-1 p-4">
                {isLoadingProducts ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                    <p className="text-gray-400 text-sm font-medium">جاري تحميل المنتجات...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Package size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold">لا توجد نتائج</p>
                    <p className="text-xs mt-1">جرّب كلمة بحث مختلفة</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredProducts.map((product, idx) => {
                      const isSelected = selectedProduct?.id === product.id;
                      return (
                        <button
                          key={product.id}
                          onClick={() => setSelectedProduct(isSelected ? null : product)}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-150 text-right group ${
                            isSelected
                              ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10"
                              : "border-transparent hover:border-gray-200 hover:bg-gray-50/80"
                          }`}
                        >
                          {/* Product image — fastest possible loading */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative bg-gray-100">
                            <ProductThumb
                              src={product.image_url}
                              alt={product.name}
                              // Pass index so first N images load with high priority
                              {...(idx < 4 ? { key: `priority-${product.id}` } : {})}
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0 text-right">
                            <p className={`font-bold text-sm line-clamp-1 transition-colors ${
                              isSelected ? "text-blue-700" : "text-gray-900"
                            }`}>
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                              <span>{product.category || "—"}</span>
                              <span className="w-1 h-1 rounded-full bg-gray-300 inline-block" />
                              <span className="font-bold text-gray-600">{product.price.toLocaleString()} د.ج</span>
                            </p>
                          </div>

                          {/* Check */}
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-150 ${
                            isSelected
                              ? "bg-blue-600 scale-100"
                              : "bg-gray-200 scale-0 group-hover:scale-75 group-hover:opacity-40"
                          }`}>
                            <CheckCircle2 size={14} className="text-white" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Footer ── */}
              <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gray-50/60 shrink-0">
                <AnimatePresence>
                  {selectedProduct && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center gap-2.5">
                        {/* Mini preview */}
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 relative bg-gray-100">
                          <ProductThumb src={selectedProduct.image_url} alt={selectedProduct.name} />
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-xs text-gray-500">سيتم إنشاء رابط لـ</p>
                          <p className="font-black text-blue-700 text-sm line-clamp-1">{selectedProduct.name}</p>
                        </div>
                        <CheckCircle2 size={18} className="text-blue-500 shrink-0" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={createShortLink}
                  disabled={!selectedProduct || isCreating}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black text-base hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <><Loader2 size={20} className="animate-spin" /> جاري الإنشاء...</>
                  ) : (
                    <><Zap size={20} /> إنشاء الرابط المختصر</>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Category Picker Modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {showCategoryPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isCreating) { setShowCategoryPicker(false); setSelectedCategory(null); setCategorySearch(""); } }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 24 }}
              transition={{ type: "spring", bounce: 0.18, duration: 0.35 }}
              className="fixed inset-x-4 top-[4%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[560px] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[92vh] flex flex-col"
            >
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl font-black text-gray-900">اختر تصنيفاً</h2>
                  <p className="text-gray-400 text-sm mt-0.5">سيتم إنشاء رابط مختصر لجميع منتجات هذا التصنيف</p>
                </div>
                <button
                  onClick={() => { if (!isCreating) { setShowCategoryPicker(false); setSelectedCategory(null); setCategorySearch(""); } }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-4 py-3 border-b border-gray-50 shrink-0">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="ابحث عن تصنيف..."
                    value={categorySearch}
                    onChange={e => setCategorySearch(e.target.value)}
                    autoFocus
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pr-9 pl-4 focus:ring-2 focus:ring-purple-500/20 outline-none text-sm font-medium"
                  />
                  {categorySearch && (
                    <button
                      onClick={() => setCategorySearch("")}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-4">
                {isLoadingCategories ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="animate-spin text-purple-500" size={32} />
                    <p className="text-gray-400 text-sm font-medium">جاري تحميل التصنيفات...</p>
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Tags size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold">{categories.length === 0 ? "لا توجد تصنيفات في القائمة" : "لا توجد نتائج"}</p>
                    <p className="text-xs mt-1">
                      {categories.length === 0
                        ? "أضف تصنيفات من لوحة التحكم &gt; الإعدادات &gt; قائمة الخدمات"
                        : "جرّب كلمة بحث مختلفة"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {filteredCategories.map((cat) => {
                      const isSelected = selectedCategory?.label === cat.label;
                      return (
                        <button
                          key={cat.label}
                          onClick={() => setSelectedCategory(isSelected ? null : cat)}
                          className={`w-full flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-150 text-right group ${
                            isSelected
                              ? "border-purple-500 bg-purple-50 shadow-md shadow-purple-500/10"
                              : "border-transparent hover:border-purple-200 hover:bg-purple-50/50"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-purple-100 flex items-center justify-center">
                            <Tags size={20} className={isSelected ? "text-purple-600" : "text-purple-400"} />
                          </div>
                          <div className="flex-1 min-w-0 text-right">
                            <p className={`font-bold text-sm transition-colors ${
                              isSelected ? "text-purple-700" : "text-gray-900"
                            }`}>
                              {cat.label}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              الرابط: /products?category={encodeURIComponent(cat.label)}
                            </p>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-150 ${
                            isSelected
                              ? "bg-purple-600 scale-100"
                              : "bg-gray-200 scale-0 group-hover:scale-75 group-hover:opacity-40"
                          }`}>
                            <CheckCircle2 size={14} className="text-white" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="px-4 pb-4 pt-3 border-t border-gray-100 bg-gray-50/60 shrink-0">
                <AnimatePresence>
                  {selectedCategory && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: "auto", marginBottom: 12 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 bg-purple-100 flex items-center justify-center">
                          <Tags size={16} className="text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                          <p className="text-xs text-gray-500">سيتم إنشاء رابط لتصنيف</p>
                          <p className="font-black text-purple-700 text-sm line-clamp-1">{selectedCategory.label}</p>
                        </div>
                        <CheckCircle2 size={18} className="text-purple-500 shrink-0" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={createCategoryLink}
                  disabled={!selectedCategory || isCreating}
                  className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-black text-base hover:bg-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-purple-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreating ? (
                    <><Loader2 size={20} className="animate-spin" /> جاري الإنشاء...</>
                  ) : (
                    <><Zap size={20} /> إنشاء رابط التصنيف</>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
