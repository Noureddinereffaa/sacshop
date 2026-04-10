"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff, Star,
  Package, Loader2, X, Save, CheckCircle2
} from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  compare_price: number | null;
  image_url: string;
  category: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  is_published: boolean;
  is_featured: boolean;
}

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "",
  description: "",
  short_description: "",
  price: 0,
  compare_price: null,
  image_url: "",
  category: "",
  sizes: [],
  colors: [],
  stock: 0,
  is_published: true,
  is_featured: false,
};

const CATEGORIES = ["حقائب جلدية", "حقائب قماشية", "حقائب ظهر", "حقائب يد", "أكياس ورقية", "أخرى"];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>(EMPTY_PRODUCT);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState({ name: "", hex: "#10a37f" });

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

  function openCreateModal() {
    setEditingProduct(EMPTY_PRODUCT);
    setIsEditMode(false);
    setIsModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct({ ...product });
    setIsEditMode(true);
    setIsModalOpen(true);
  }

  async function saveProduct() {
    if (!supabase || !editingProduct.name || !editingProduct.price) return;
    setIsSaving(true);
    try {
      if (isEditMode && editingProduct.id) {
        const { id, ...rest } = editingProduct as Product;
        await supabase.from("products").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id);
      } else {
        await supabase.from("products").insert([editingProduct]);
      }
      setSaveSuccess(true);
      setTimeout(() => { setSaveSuccess(false); setIsModalOpen(false); fetchProducts(); }, 1500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  }

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

  function addSize() {
    if (!newSize.trim()) return;
    setEditingProduct(p => ({ ...p, sizes: [...(p.sizes || []), newSize.trim()] }));
    setNewSize("");
  }

  function removeSize(s: string) {
    setEditingProduct(p => ({ ...p, sizes: (p.sizes || []).filter(x => x !== s) }));
  }

  function addColor() {
    if (!newColor.name.trim()) return;
    setEditingProduct(p => ({ ...p, colors: [...(p.colors || []), { ...newColor }] }));
    setNewColor({ name: "", hex: "#10a37f" });
  }

  function removeColor(name: string) {
    setEditingProduct(p => ({ ...p, colors: (p.colors || []).filter(c => c.name !== name) }));
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">إدارة المنتجات</h1>
          <p className="text-gray-500">{products.length} منتج في المتجر</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus size={20} />
          إضافة منتج جديد
        </button>
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
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-5">المنتج</th>
                  <th className="px-6 py-5">السعر</th>
                  <th className="px-6 py-5">التصنيف</th>
                  <th className="px-6 py-5">المخزون</th>
                  <th className="px-6 py-5">الحالة</th>
                  <th className="px-6 py-5 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden shrink-0 relative">
                          {product.image_url ? (
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
                            <span className="text-[10px] bg-yellow-100 text-yellow-600 font-bold px-2 py-0.5 rounded-full">
                              ⭐ مميز
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-black text-primary">{product.price.toLocaleString()} د.ج</p>
                      {product.compare_price && (
                        <p className="text-xs text-gray-400 line-through">{product.compare_price.toLocaleString()} د.ج</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                        {product.category || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold text-sm ${product.stock <= 5 ? "text-red-500" : "text-gray-700"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-black ${product.is_published ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"}`}>
                        {product.is_published ? "منشور" : "مخفي"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => toggleFeatured(product.id, product.is_featured)} className={`p-2 rounded-lg transition-colors ${product.is_featured ? "text-yellow-500 bg-yellow-50" : "text-gray-400 hover:bg-gray-100"}`} title="تمييز">
                          <Star size={16} />
                        </button>
                        <button onClick={() => togglePublish(product.id, product.is_published)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-lg transition-colors" title={product.is_published ? "إخفاء" : "نشر"}>
                          {product.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button onClick={() => openEditModal(product)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="تعديل">
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => deleteProduct(product.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
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

      {/* Modal: Add/Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-black text-gray-900">
                {isEditMode ? "تعديل المنتج" : "إضافة منتج جديد"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {saveSuccess && (
                <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-2 font-bold">
                  <CheckCircle2 size={20} /> تم الحفظ بنجاح!
                </div>
              )}

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">اسم المنتج *</label>
                  <input
                    type="text"
                    value={editingProduct.name || ""}
                    onChange={e => setEditingProduct(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="مثال: حقيبة جلدية فاخرة"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">التصنيف</label>
                  <select
                    value={editingProduct.category || ""}
                    onChange={e => setEditingProduct(p => ({ ...p, category: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="">اختر تصنيفاً...</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">السعر (د.ج) *</label>
                  <input
                    type="number"
                    value={editingProduct.price || ""}
                    onChange={e => setEditingProduct(p => ({ ...p, price: Number(e.target.value) }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none font-black"
                    placeholder="3500"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">سعر قبل التخفيض</label>
                  <input
                    type="number"
                    value={editingProduct.compare_price || ""}
                    onChange={e => setEditingProduct(p => ({ ...p, compare_price: Number(e.target.value) || null }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="5000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">المخزون</label>
                  <input
                    type="number"
                    value={editingProduct.stock || ""}
                    onChange={e => setEditingProduct(p => ({ ...p, stock: Number(e.target.value) }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">رابط الصورة الرئيسية</label>
                  <input
                    type="text"
                    value={editingProduct.image_url || ""}
                    onChange={e => setEditingProduct(p => ({ ...p, image_url: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                    dir="ltr"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700">وصف قصير</label>
                <input
                  type="text"
                  value={editingProduct.short_description || ""}
                  onChange={e => setEditingProduct(p => ({ ...p, short_description: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="يظهر في بطاقة المنتج"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700">الوصف الكامل</label>
                <textarea
                  value={editingProduct.description || ""}
                  onChange={e => setEditingProduct(p => ({ ...p, description: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none h-28 resize-none"
                  placeholder="وصف تفصيلي للمنتج..."
                />
              </div>

              {/* Sizes */}
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-700">المقاسات المتاحة</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSize}
                    onChange={e => setNewSize(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addSize()}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="مثال: صغير، متوسط، كبير"
                  />
                  <button onClick={addSize} className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm">
                    إضافة
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editingProduct.sizes || []).map(s => (
                    <span key={s} className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-bold">
                      {s}
                      <button onClick={() => removeSize(s)} className="text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-700">الألوان المتاحة</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newColor.hex}
                    onChange={e => setNewColor(c => ({ ...c, hex: e.target.value }))}
                    className="w-12 h-10 rounded-lg cursor-pointer border-none p-0"
                  />
                  <input
                    type="text"
                    value={newColor.name}
                    onChange={e => setNewColor(c => ({ ...c, name: e.target.value }))}
                    onKeyDown={e => e.key === "Enter" && addColor()}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="اسم اللون (مثال: أحمر)"
                  />
                  <button onClick={addColor} className="bg-primary text-white px-4 py-2 rounded-xl font-bold text-sm">
                    إضافة
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editingProduct.colors || []).map(c => (
                    <span key={c.name} className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm font-bold">
                      <span className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} />
                      {c.name}
                      <button onClick={() => removeColor(c.name)} className="text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex gap-6 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setEditingProduct(p => ({ ...p, is_published: !p.is_published }))}
                    className={`w-12 h-6 rounded-full transition-colors ${editingProduct.is_published ? "bg-primary" : "bg-gray-200"} relative`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${editingProduct.is_published ? "left-7" : "left-1"}`} />
                  </div>
                  <span className="font-bold text-gray-700">منشور</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div
                    onClick={() => setEditingProduct(p => ({ ...p, is_featured: !p.is_featured }))}
                    className={`w-12 h-6 rounded-full transition-colors ${editingProduct.is_featured ? "bg-yellow-400" : "bg-gray-200"} relative`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${editingProduct.is_featured ? "left-7" : "left-1"}`} />
                  </div>
                  <span className="font-bold text-gray-700">مميز في الرئيسية</span>
                </label>
              </div>

              {/* Save */}
              <button
                onClick={saveProduct}
                disabled={isSaving || !editingProduct.name || !editingProduct.price}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
                {isSaving ? "جاري الحفظ..." : isEditMode ? "حفظ التعديلات" : "إضافة المنتج"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
