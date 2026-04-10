"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff, Star,
  Package, Loader2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setIsLoading(true);
    if (!supabase) { setIsLoading(false); return; }
    const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
    setProducts(data || []);
    setIsLoading(false);
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  async function togglePublish(id: string, current: boolean) {
    if (!supabase) return;
    await supabase.from("products").update({ is_published: !current }).eq("id", id);
    fetchProducts();
  }

  async function toggleFeatured(id: string, current: boolean) {
    if (!supabase) return;
    await supabase.from("products").update({ is_featured: !current }).eq("id", id);
    fetchProducts();
  }

  async function deleteProduct(id: string) {
    if (!supabase || !confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">إدارة المنتجات</h1>
          <p className="text-gray-500">{products.length} منتج في المتجر</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة منتج جديد
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي المنتجات", value: products.length, color: "bg-blue-50 text-blue-600" },
          { label: "منشور", value: products.filter(p => p.is_published).length, color: "bg-green-50 text-green-600" },
          { label: "مميز", value: products.filter(p => p.is_featured).length, color: "bg-yellow-50 text-yellow-600" },
          { label: "مخفي", value: products.filter(p => !p.is_published).length, color: "bg-gray-100 text-gray-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-xs font-bold mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color.split(" ")[1]}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="البحث عن منتج..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Package size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold">لا توجد منتجات</p>
            <p className="text-sm">أضف أول منتج لمتجرك</p>
          </div>
        ) : (
          <div className="overflow-x-hidden">
            <table className="w-full text-right block lg:table">
              <thead className="hidden lg:table-header-group">
                <tr className="bg-gray-50 text-gray-500 text-xs font-black uppercase tracking-widest border-b border-gray-100 block lg:table-row">
                  <th className="px-6 py-5 block lg:table-cell">المنتج</th>
                  <th className="px-6 py-5 block lg:table-cell">السعر</th>
                  <th className="px-6 py-5 block lg:table-cell">التصنيف</th>
                  <th className="px-6 py-5 block lg:table-cell">المخزون</th>
                  <th className="px-6 py-5 block lg:table-cell">الحالة</th>
                  <th className="px-6 py-5 text-center block lg:table-cell">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="block lg:table-row-group divide-y lg:divide-y-0 lg:divide-gray-100">
                {filtered.map(product => (
                  <tr key={product.id} className="block lg:table-row hover:bg-gray-50/50 transition-colors bg-white lg:bg-transparent rounded-2xl mb-4 p-4 lg:p-0 shadow-sm lg:shadow-none border border-gray-100 lg:border-none">
                    <td className="px-4 py-3 lg:px-6 lg:py-4 block lg:table-cell border-b border-gray-50 lg:border-none">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                          {product.image_url && product.image_url.startsWith('http') ? (
                            <Image src={product.image_url} alt={product.name} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                          {product.is_featured && (
                            <span className="text-[10px] bg-yellow-100 text-yellow-600 font-bold px-2 py-0.5 rounded-full inline-block mt-1">
                              ⭐ مميز
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-4 block lg:table-cell flex items-center justify-between lg:justify-start border-b border-gray-50 lg:border-none">
                      <span className="lg:hidden text-xs text-gray-400 font-bold">السعر</span>
                      <div className="text-left lg:text-right">
                        <p className="font-black text-primary text-base lg:text-sm">{product.price.toLocaleString()} د.ج</p>
                        {product.compare_price && (
                          <p className="text-xs text-gray-400 line-through">{product.compare_price.toLocaleString()} د.ج</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-4 block lg:table-cell flex items-center justify-between lg:justify-start border-b border-gray-50 lg:border-none">
                      <span className="lg:hidden text-xs text-gray-400 font-bold">التصنيف</span>
                      <span className="text-xs lg:text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                        {product.category || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-4 block lg:table-cell flex items-center justify-between lg:justify-start border-b border-gray-50 lg:border-none">
                      <span className="lg:hidden text-xs text-gray-400 font-bold">المخزون</span>
                      <span className={`font-bold text-sm ${product.stock <= 5 ? "text-red-500" : "text-gray-700"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-4 block lg:table-cell flex items-center justify-between lg:justify-start border-b border-gray-50 lg:border-none">
                       <span className="lg:hidden text-xs text-gray-400 font-bold">الحالة</span>
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black ${product.is_published ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                        {product.is_published ? "منشور" : "مخفي"}
                      </span>
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-4 block lg:table-cell flex items-center justify-between lg:justify-center mt-2 lg:mt-0">
                      <span className="lg:hidden text-xs text-gray-400 font-bold">الإجراءات</span>
                      <div className="flex items-center justify-end lg:justify-center gap-1">
                        <button onClick={() => toggleFeatured(product.id, product.is_featured)} className={`p-2 lg:p-2 w-10 h-10 lg:w-auto lg:h-auto flex items-center justify-center rounded-lg transition-colors ${product.is_featured ? "text-yellow-500 bg-yellow-50" : "text-gray-400 hover:bg-gray-100"}`} title="تمييز">
                          <Star size={16} />
                        </button>
                        <button onClick={() => togglePublish(product.id, product.is_published)} className="p-2 lg:p-2 w-10 h-10 lg:w-auto lg:h-auto flex items-center justify-center text-blue-400 hover:bg-blue-50 rounded-lg transition-colors" title={product.is_published ? "إخفاء" : "نشر"}>
                          {product.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <Link href={`/admin/products/${product.id}/edit`} className="p-2 lg:p-2 w-10 h-10 lg:w-auto lg:h-auto flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="تعديل">
                          <Edit2 size={16} />
                        </Link>
                        <button onClick={() => deleteProduct(product.id)} className="p-2 lg:p-2 w-10 h-10 lg:w-auto lg:h-auto flex items-center justify-center text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
