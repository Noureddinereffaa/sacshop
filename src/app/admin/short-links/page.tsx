"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// Minimal product shape — matches the partial SELECT fields we fetch
interface ProductSummary {
  id: string;
  name: string;
  image_url: string;
  category: string;
  price: number;
  is_published: boolean;
}
import {
  Link2, Copy, Trash2, Search, Plus, ExternalLink,
  Loader2, CheckCircle2, TrendingUp, MousePointerClick,
  Package, Zap, Facebook, RefreshCw, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import OptimizedImage from "@/components/OptimizedImage";

interface ShortLink {
  id: string;
  slug: string;
  product_id: string;
  product_name: string;
  destination: string;
  clicks: number;
  created_at: string;
}

const BASE_URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXT_PUBLIC_SITE_URL || "";

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
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  const fetchLinks = useCallback(async () => {
    setIsLoadingLinks(true);
    const res = await fetch("/api/short-links");
    const json = await res.json();
    setLinks(json.data || []);
    setIsLoadingLinks(false);
  }, []);

  useEffect(() => {
    // Fetch products
    async function fetchProducts() {
      if (!supabase) { setIsLoadingProducts(false); return; }
      const { data } = await supabase
        .from("products")
        .select("id, name, image_url, category, price, is_published")
        .eq("is_published", true)
        .order("sort_order", { ascending: true, nullsFirst: false });
      setProducts(data || []);
      setIsLoadingProducts(false);
    }
    fetchProducts();
    fetchLinks();
  }, [fetchLinks]);

  const filteredLinks = links.filter(l =>
    l.product_name.toLowerCase().includes(search.toLowerCase()) ||
    l.slug.includes(search.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.category?.toLowerCase().includes(productSearch.toLowerCase())
  );

  async function createShortLink() {
    if (!selectedProduct) return;
    setIsCreating(true);
    const destination = `${BASE_URL}/products/${selectedProduct.id}`;
    await fetch("/api/short-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        destination,
      }),
    });
    await fetchLinks();
    setSelectedProduct(null);
    setShowProductPicker(false);
    setProductSearch("");
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
        <button
          onClick={() => setShowProductPicker(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus size={20} />
          إنشاء رابط جديد
        </button>
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
          <p className="font-black text-lg">إعادة توجيه فورية &lt; 2 ثانية</p>
          <p className="text-blue-100 text-sm mt-0.5">
            الروابط المختصرة تعيد التوجيه بشكل فوري إلى صفحة المنتج — مثالي لإعلانات فيسبوك وإنستغرام
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
            <p className="text-sm mt-1">اضغط على "إنشاء رابط جديد" لإنشاء أول رابط مختصر</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-5">المنتج</th>
                  <th className="px-6 py-5">الرابط المختصر</th>
                  <th className="px-6 py-5 text-center">النقرات</th>
                  <th className="px-6 py-5">التاريخ</th>
                  <th className="px-6 py-5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                <AnimatePresence>
                  {filteredLinks.map(link => {
                    const shortUrl = `${BASE_URL}/api/short-links/${link.slug}`;
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
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative">
                              {/* Product image will not be available without extra fetch — use icon */}
                              <Package size={18} className="text-gray-400" />
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

                        {/* Short URL */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <code className="bg-gray-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-black tracking-tight max-w-[220px] truncate">
                              /api/short-links/{link.slug}
                            </code>
                          </div>
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

      {/* Product Picker Modal */}
      <AnimatePresence>
        {showProductPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowProductPicker(false); setSelectedProduct(null); setProductSearch(""); }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              className="fixed inset-x-4 top-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[540px] bg-white rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-gray-900">اختر منتجاً</h2>
                  <p className="text-gray-500 text-sm mt-0.5">سيتم إنشاء رابط مختصر يوجه إلى هذا المنتج</p>
                </div>
                <button
                  onClick={() => { setShowProductPicker(false); setSelectedProduct(null); setProductSearch(""); }}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-gray-50">
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="البحث عن منتج..."
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    autoFocus
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2.5 pr-10 pl-4 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm font-medium"
                  />
                </div>
              </div>

              {/* Product List */}
              <div className="overflow-y-auto flex-1 p-4 space-y-2">
                {isLoadingProducts ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-blue-500" size={28} />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Package size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="font-bold">لا توجد منتجات</p>
                  </div>
                ) : (
                  filteredProducts.map(product => {
                    const isSelected = selectedProduct?.id === product.id;
                    return (
                      <button
                        key={product.id}
                        onClick={() => setSelectedProduct(isSelected ? null : (product as ProductSummary))}
                        className={`w-full flex items-center gap-4 p-3 rounded-2xl border-2 transition-all text-right ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10"
                            : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                          {product.image_url && product.image_url.startsWith("http") ? (
                            <OptimizedImage
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package size={20} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-sm line-clamp-1 ${isSelected ? "text-blue-700" : "text-gray-900"}`}>
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {product.category || "—"} · {product.price.toLocaleString()} د.ج
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
                            <CheckCircle2 size={14} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                {selectedProduct && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-3 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                    <div className="text-sm">
                      <span className="text-gray-500">سيتم إنشاء رابط لـ: </span>
                      <span className="font-black text-blue-700">{selectedProduct.name}</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={createShortLink}
                  disabled={!selectedProduct || isCreating}
                  className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
    </div>
  );
}
