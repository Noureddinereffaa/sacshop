"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, X, Plus, Image as ImageIcon, ArrowRight, Zap, Tag } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types"; // We will make sure this exists

const EMPTY_PRODUCT: Partial<Product> = {
  name: "",
  description: "",
  short_description: "",
  price: 0,
  compare_price: null,
  image_url: "",
  gallery: [],
  category: "",
  sizes: [],
  colors: [],
  stock: 0,
  is_published: true,
  is_featured: false,
  quantity_tiers: [],
  variant_images: [],
  printing_config: { extra_color_price: 15, base_colors_included: 1 },
};


interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;
  const [product, setProduct] = useState<Partial<Product>>(initialData || EMPTY_PRODUCT);
  
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState({ name: "", hex: "#00AEEF" });
  const [newTier, setNewTier] = useState({ min_qty: 200, unit_price: 0 });
  const [newVariantImage, setNewVariantImage] = useState({ size: "", color: "", image_url: "" });

  useEffect(() => {
    async function fetchCategories() {
      if (!supabase) return;
      const { data } = await supabase.from("settings").select("value").eq("key", "branding").single();
      if (data && data.value && data.value.navigation) {
        const nav: { label: string }[] = data.value.navigation;
        setDynamicCategories(nav.map(item => item.label));
      } else {
        // Fallback or handle missing navigation
        setDynamicCategories(["أكياس ورقية", "ملصقات", "مطبوعات", "أخرى"]);
      }
    }
    fetchCategories();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !product.name || !product.price) return;
    
    setIsSaving(true);
    try {
      if (isEditMode && product.id) {
        const { id, ...rest } = product as Product;
        const { error } = await supabase.from("products").update({ ...rest, updated_at: new Date().toISOString() }).eq("id", id);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await supabase.from("products").insert([product]);
        if (error) throw new Error(error.message);
      }
      
      router.push("/admin/products");
      router.refresh(); // refresh the list
    } catch (err: any) {
      alert("خطأ أثناء الحفظ (هل أضفت قاعدة البيانات بشكل صحيح؟): " + err.message);
    } finally {
      setIsSaving(false);
    }
  }

  // Helper arrays functions
  const addSize = () => {
    if (!newSize.trim()) return;
    setProduct(p => ({ ...p, sizes: [...(p.sizes || []), newSize.trim()] }));
    setNewSize("");
  };
  const removeSize = (s: string) => setProduct(p => ({ ...p, sizes: (p.sizes || []).filter(x => x !== s) }));

  const addColor = () => {
    if (!newColor.name.trim()) return;
    setProduct(p => ({ ...p, colors: [...(p.colors || []), { ...newColor }] }));
    setNewColor({ name: "", hex: "#10a37f" });
  };
  const removeColor = (n: string) => setProduct(p => ({ ...p, colors: (p.colors || []).filter(x => x.name !== n) }));

  const addTier = () => {
    if (newTier.min_qty <= 0 || newTier.unit_price <= 0) return;
    setProduct(p => ({ ...p, quantity_tiers: [...(p.quantity_tiers || []), { ...newTier }].sort((a,b) => a.min_qty - b.min_qty) }));
    setNewTier({ min_qty: 200, unit_price: 0 });
  };
  const removeTier = (min_qty: number) => setProduct(p => ({ ...p, quantity_tiers: (p.quantity_tiers || []).filter(x => x.min_qty !== min_qty) }));

  const addVariantImage = () => {
    if (!newVariantImage.image_url) return;
    setProduct(p => ({ ...p, variant_images: [...(p.variant_images || []), { ...newVariantImage }] }));
    setNewVariantImage({ size: "", color: "", image_url: "" });
  };
  const removeVariantImage = (idx: number) => setProduct(p => ({ ...p, variant_images: (p.variant_images || []).filter((_, i) => i !== idx) }));

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/admin/products" className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
             <ArrowRight size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">{isEditMode ? "تعديل منتج" : "إضافة منتج جديد"}</h1>
            <p className="text-gray-500 font-medium text-sm">{isEditMode ? "تحديث معلومات المنتج الحالي" : "أدخل تفاصيل المنتج ليتم نشره في المتجر"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
             type="button"
             onClick={() => router.push("/admin/products")}
             className="flex-1 sm:flex-none px-6 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
          >
             إلغاء
          </button>
          <button 
             type="submit"
             disabled={isSaving || !product.name || !product.price}
             className="flex-1 sm:flex-none bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
             {isSaving && <Loader2 size={18} className="animate-spin" />}
             {isSaving ? "جاري الحفظ..." : "حفظ المنتج"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ======== LEFT COLUMN (Main Info) ======== */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Basic Info */}
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-4">
                 معلومات أساسية
              </h2>
              
              <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-sm font-black text-gray-700 block">اسم المنتج *</label>
                   <input
                     required
                     type="text"
                     value={product.name || ""}
                     onChange={e => setProduct(p => ({ ...p, name: e.target.value }))}
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-gray-900"
                     placeholder="مثال: حقيبة جلدية كلاسيكية"
                   />
                 </div>
                 
                 <div className="space-y-2">
                   <label className="text-sm font-black text-gray-700 block">وصف قصير (يظهر في القوائم)</label>
                   <input
                     type="text"
                     value={product.short_description || ""}
                     onChange={e => setProduct(p => ({ ...p, short_description: e.target.value }))}
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                     placeholder="وصف مختصر للمنتج..."
                   />
                 </div>

                 <div className="space-y-2">
                   <label className="text-sm font-black text-gray-700 block">الوصف التفصيلي</label>
                   <textarea
                     value={product.description || ""}
                     onChange={e => setProduct(p => ({ ...p, description: e.target.value }))}
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all h-32 resize-none leading-relaxed"
                     placeholder="اكتب التوصيف الكامل للمنتج هنا ومميزاته..."
                   />
                 </div>
              </div>
           </div>

           {/* Variants (Sizes & Colors & Packages) */}
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-4">
                 الخصائص والمتغيرات
              </h2>

              {/* Sizes */}
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-700 block">المقاسات (اضغط Enter للإضافة)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSize}
                    onChange={e => setNewSize(e.target.value)}
                    onKeyDown={e => {
                       if(e.key === "Enter") { e.preventDefault(); addSize(); }
                    }}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="مثال: Small, Medium..."
                  />
                  <button type="button" onClick={addSize} className="bg-primary/10 text-primary px-6 rounded-xl font-bold hover:bg-primary/20 transition-colors">إضافة</button>
                </div>
                {product.sizes && product.sizes.length > 0 && (
                   <div className="flex flex-wrap gap-2 pt-2">
                     {product.sizes.map(s => (
                       <span key={s} className="flex items-center gap-1.5 bg-gray-100/80 px-4 py-2 rounded-full text-sm font-bold text-gray-700">
                         {s}
                         <button type="button" onClick={() => removeSize(s)} className="text-gray-400 hover:text-red-500 bg-white rounded-full p-0.5"><X size={14} /></button>
                       </span>
                     ))}
                   </div>
                )}
              </div>

              {/* Colors */}
              <div className="space-y-3">
                <label className="text-sm font-black text-gray-700 block">الألوان</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={newColor.hex}
                    onChange={e => setNewColor(c => ({ ...c, hex: e.target.value }))}
                    className="w-14 h-12 rounded-xl cursor-pointer border-none p-0 overflow-hidden"
                  />
                  <input
                    type="text"
                    value={newColor.name}
                    onChange={e => setNewColor(c => ({ ...c, name: e.target.value }))}
                    onKeyDown={e => {
                       if(e.key === "Enter") { e.preventDefault(); addColor(); }
                    }}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="اسم اللون (أبيض، أسود...)"
                  />
                  <button type="button" onClick={addColor} className="bg-primary/10 text-primary px-6 rounded-xl font-bold hover:bg-primary/20 transition-colors">إضافة</button>
                </div>
                {product.colors && product.colors.length > 0 && (
                   <div className="flex flex-wrap gap-2 pt-2">
                     {product.colors.map(c => (
                       <span key={c.name} className="flex items-center gap-2 bg-gray-100/80 px-4 py-2 rounded-full text-sm font-bold text-gray-700">
                         <span className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: c.hex }} />
                         {c.name}
                         <button type="button" onClick={() => removeColor(c.name)} className="text-gray-400 hover:text-red-500 bg-white rounded-full p-0.5"><X size={14} /></button>
                       </span>
                     ))}
                   </div>
                )}
              </div>

              {/* Quantity Tiers (Strict Order Amounts) */}
              <div className="space-y-4 pt-6 border-t border-gray-50">
                <label className="text-sm font-black text-gray-900 block flex items-center gap-2">
                   <Tag size={16} className="text-primary" /> تحديد كميات الطلب المتاحة وأسعارها
                </label>
                <p className="text-xs text-gray-500 font-medium bg-blue-50 p-3 rounded-xl border border-blue-100/50">
                  ملاحظة: النظام سيسمح للزبون بالاختيار فقط من بين هذه الكميات المحددة.
                </p>
                <div className="flex gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase pr-1">الكمية</label>
                    <input
                      type="number"
                      value={newTier.min_qty || ""}
                      onChange={e => setNewTier(p => ({ ...p, min_qty: Number(e.target.value) }))}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold text-gray-900"
                      placeholder="مثلاً 200"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase pr-1">سعر القطعة (د.ج)</label>
                    <input
                      type="number"
                      value={newTier.unit_price || ""}
                      onChange={e => setNewTier(p => ({ ...p, unit_price: Number(e.target.value) }))}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-black text-primary"
                      placeholder="مثلاً 63"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={addTier} 
                    className="self-end bg-gray-900 text-white px-6 h-[50px] rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                  >
                    إضافة
                  </button>
                </div>
                {product.quantity_tiers && product.quantity_tiers.length > 0 && (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                     {product.quantity_tiers.map(tier => (
                       <div key={tier.min_qty} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group hover:border-primary/30 transition-all">
                         <div>
                            <span className="text-[10px] font-black text-gray-400 block uppercase">كمية محددة</span>
                            <span className="font-black text-gray-900">{tier.min_qty} قطعة</span>
                         </div>
                         <div className="flex items-center gap-4">
                           <div className="text-left">
                              <span className="text-[10px] font-black text-gray-400 block uppercase">السعر</span>
                              <span className="font-black text-primary">{tier.unit_price} د.ج</span>
                           </div>
                           <button type="button" onClick={() => removeTier(tier.min_qty)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white">
                              <X size={14} />
                           </button>
                         </div>
                       </div>
                     ))}
                   </div>
                )}
              </div>
           </div>
        </div>

        {/* ======== RIGHT COLUMN (Media, Pricing, Meta) ======== */}
        <div className="space-y-8">
           
           {/* Images Card */}
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-4">
                 الصور
              </h2>
              <ImageUploader 
                 value={product.image_url || ""} 
                 onChange={(url) => setProduct(p => ({...p, image_url: url}))}
                 label="الصورة الرئيسية للمنتج"
              />
              
              <div className="space-y-2 pt-4 border-t border-gray-50">
                 <label className="text-sm font-black text-gray-700">معرض الصور (اختياري)</label>
                 {product.gallery && product.gallery.length > 0 && (
                   <div className="grid grid-cols-3 gap-2 mb-4">
                     {product.gallery.map((img, i) => (
                        <div key={i} className="aspect-square relative rounded-xl overflow-hidden border border-gray-100 group">
                           {/* eslint-disable-next-line @next/next/no-img-element */}
                           <img src={img} alt="Gallery" className="w-full h-full object-cover" />
                           <button 
                             type="button"
                             onClick={() => setProduct(p => ({...p, gallery: p.gallery!.filter((_, idx) => idx !== i)}))}
                             className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white"
                           >
                              <X size={20} />
                           </button>
                        </div>
                     ))}
                   </div>
                 )}
                 {(!product.gallery || product.gallery.length < 5) && (
                    <ImageUploader 
                      value="" 
                      onChange={(url) => setProduct(p => ({...p, gallery: [...(p.gallery || []), url]}))}
                      label=""
                      placeholder="أضف للملصقات..."
                    />
                 )}
              </div>

              {/* Variant Images Section */}
              <div className="space-y-4 pt-6 border-t border-gray-50">
                  <label className="text-sm font-black text-gray-900 block flex items-center gap-2">
                     <ImageIcon size={16} /> ربط الصور بالمقاسات والألوان
                  </label>
                  <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                     <div className="grid grid-cols-2 gap-2">
                        <select 
                          value={newVariantImage.size}
                          onChange={e => setNewVariantImage(v => ({...v, size: e.target.value}))}
                          className="bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold"
                        >
                           <option value="">المقاس...</option>
                           {product.sizes?.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select 
                          value={newVariantImage.color}
                          onChange={e => setNewVariantImage(v => ({...v, color: e.target.value}))}
                          className="bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold"
                        >
                           <option value="">اللون...</option>
                           {product.colors?.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                     </div>
                     <ImageUploader 
                       value={newVariantImage.image_url}
                       onChange={url => setNewVariantImage(v => ({...v, image_url: url}))}
                       label=""
                       placeholder="صورة المتغير..."
                     />
                     <button 
                       type="button" 
                       onClick={addVariantImage}
                       className="w-full bg-primary/10 text-primary py-2 rounded-xl font-bold flex items-center justify-center gap-2"
                     >
                        <Plus size={16} /> تثبيت صورة المتغير
                     </button>
                  </div>

                   {product.variant_images && product.variant_images.length > 0 && (
                    <div className="grid grid-cols-1 gap-2">
                       {product.variant_images.map((vi, idx) => (
                         <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm group hover:border-primary/20 transition-all">
                            <div className="w-14 h-14 relative rounded-xl overflow-hidden border border-gray-100 shrink-0 bg-gray-50">
                               <Image src={vi.image_url} alt="" fill className="object-cover" unoptimized />
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">تخصيص العرض لـ:</p>
                               <div className="flex flex-wrap gap-1.5">
                                  <span className="bg-gray-50 text-gray-700 px-2 py-0.5 rounded-md text-[10px] font-black border border-gray-100">
                                     {vi.size || 'كل المقاسات'}
                                  </span>
                                  <span className="bg-gray-50 text-gray-700 px-2 py-0.5 rounded-md text-[10px] font-black border border-gray-100">
                                     {vi.color || 'كل الألوان'}
                                  </span>
                               </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => removeVariantImage(idx)} 
                              className="w-10 h-10 flex items-center justify-center bg-gray-50 text-gray-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:text-red-500"
                            >
                               <X size={18} />
                            </button>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
           </div>

            {/* Pricing & Stock Card */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
               <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-4">
                  التسعير والمخزون
               </h2>
               
               <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700 block text-primary">السعر الفردي العادي (د.ج) *</label>
                    <input
                      required
                      type="number"
                      value={product.price || ""}
                      onChange={e => setProduct(p => ({ ...p, price: Number(e.target.value) }))}
                      className="w-full bg-primary/5 border border-primary/20 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/40 outline-none font-black text-primary text-xl"
                    />
                 </div>

                 {/* Printing Config (Added based on user request) */}
                 <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                    <label className="text-xs font-black text-gray-500 uppercase flex items-center gap-2">
                       <Zap size={14} className="text-yellow-500" /> إعدادات الطباعة Serigraphie
                    </label>
                    <div className="space-y-2">
                       <label className="text-xs font-bold text-gray-600">سعر اللون الإضافي (د.ج)</label>
                       <input 
                         type="number"
                         value={product.printing_config?.extra_color_price || 15}
                         onChange={e => setProduct(p => ({
                           ...p, 
                           printing_config: { ...p.printing_config, extra_color_price: Number(e.target.value) }
                         }))}
                         className="w-full bg-white border border-gray-200 rounded-lg p-2 text-sm font-bold"
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 block">السعر قبل التخفيض المشطوب (د.ج)</label>
                    <input
                      type="number"
                      value={product.compare_price || ""}
                      onChange={e => setProduct(p => ({ ...p, compare_price: Number(e.target.value) || null }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none line-through text-gray-400"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700 block">الكمية في المخزن</label>
                    <input
                      type="number"
                      value={product.stock || ""}
                      onChange={e => setProduct(p => ({ ...p, stock: Number(e.target.value) }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                 </div>
               </div>
            </div>

           {/* Classification Card */}
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2 border-b border-gray-50 pb-4">
                 حالة الظهور والتصنيف
              </h2>
              
              <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-sm font-black text-gray-700 block">التصنيف الرئيسي</label>
                   <select
                     value={product.category || ""}
                     onChange={e => setProduct(p => ({ ...p, category: e.target.value }))}
                     className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none font-bold"
                   >
                     <option value="">اختر تصنيفاً...</option>
                     {dynamicCategories.map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>

                 {/* Toggles */}
                 <div className="pt-4 space-y-4">
                    <label className="flex items-center justify-between cursor-pointer p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                         <span className="font-black text-gray-900 block">نشر المنتج</span>
                         <span className="text-xs text-gray-500 font-medium mt-1 block">هل ترغب بعرض هذا المنتج للزبائن؟</span>
                      </div>
                      <div className={`w-12 h-6 rounded-full transition-colors ${product.is_published ? "bg-[#25D366]" : "bg-gray-300"} relative`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${product.is_published ? "left-7" : "left-1"}`} />
                      </div>
                    </label>

                    <label className="flex items-center justify-between cursor-pointer p-4 bg-yellow-50/50 rounded-xl border border-yellow-100">
                      <div>
                         <span className="font-black text-yellow-600 block">منتج مميز ⭐</span>
                         <span className="text-xs text-yellow-500 font-medium mt-1 block">يظهر في قمة الصفحة الرئيسية للمتجر</span>
                      </div>
                      <div className={`w-12 h-6 rounded-full transition-colors ${product.is_featured ? "bg-yellow-400" : "bg-gray-300"} relative`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${product.is_featured ? "left-7" : "left-1"}`} />
                      </div>
                    </label>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </form>
  );
}
