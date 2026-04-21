"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, X, Plus, Image as ImageIcon, ArrowRight, Zap, Tag, Sliders } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import Link from "next/link";
import Image from "next/image";
import { Product, CustomVariantGroup } from "@/types";

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
  custom_variants: [],
  size_color_availability: {},
};


interface ProductFormProps {
  initialData?: Product;
}

export default function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = !!initialData;
  const initialIsMatrix = Array.isArray(initialData?.quantity_tiers) && 
    initialData!.quantity_tiers.length > 0 && 
    !!(initialData!.quantity_tiers[0] as any).size;
  
  const [pricingMode, setPricingMode] = useState<"flat" | "matrix">(initialIsMatrix ? "matrix" : "flat");
  const [matrixSizeSelection, setMatrixSizeSelection] = useState("");
  
  const [product, setProduct] = useState<Partial<Product>>(initialData || EMPTY_PRODUCT);
  
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [newSize, setNewSize] = useState("");
  const [newColor, setNewColor] = useState({ name: "", hex: "#00AEEF", extra_cost: 0 });
  const [newTier, setNewTier] = useState({ min_qty: 200, unit_price: 0 });
  const [newVariantImage, setNewVariantImage] = useState({ size: "", color: "", image_url: "" });

  useEffect(() => {
    async function fetchCategories() {
      if (!supabase) return;
      // Fetch specifically from the 'navigation' key in settings
      const { data } = await supabase.from("settings").select("value").eq("key", "navigation").single();
      
      if (data && Array.isArray(data.value)) {
        const nav: { label: string }[] = data.value;
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
    setNewColor({ name: "", hex: "#10a37f", extra_cost: 0 });
  };
  const removeColor = (n: string) => setProduct(p => ({ ...p, colors: (p.colors || []).filter(x => x.name !== n) }));

  const addFlatTier = () => {
    if (newTier.min_qty <= 0 || newTier.unit_price <= 0) return;
    setProduct(p => ({ ...p, quantity_tiers: [...(p.quantity_tiers || []), { ...newTier }].sort((a:any, b:any) => a.min_qty - b.min_qty) }));
    setNewTier({ min_qty: 200, unit_price: 0 });
  };
  const removeFlatTier = (min_qty: number) => setProduct(p => ({ ...p, quantity_tiers: (p.quantity_tiers || []).filter((x:any) => x.min_qty !== min_qty) }));

  const addMatrixTier = () => {
     if (!matrixSizeSelection || newTier.min_qty <= 0 || newTier.unit_price <= 0) return;
     setProduct(p => {
       const qt = [...(p.quantity_tiers || [])];
       const sizeIdx = qt.findIndex((q:any) => q.size === matrixSizeSelection);
       if (sizeIdx >= 0) {
         qt[sizeIdx].tiers.push({ min_qty: newTier.min_qty, unit_price: newTier.unit_price });
         qt[sizeIdx].tiers.sort((a:any, b:any) => a.min_qty - b.min_qty);
       } else {
         qt.push({ size: matrixSizeSelection, tiers: [{ min_qty: newTier.min_qty, unit_price: newTier.unit_price }] });
       }
       return { ...p, quantity_tiers: qt };
     });
     setNewTier({ min_qty: 200, unit_price: 0 });
  };
  const removeMatrixTier = (size: string, min_qty: number) => {
     setProduct(p => {
       const qt: any[] = [...(p.quantity_tiers || [])];
       const sizeIdx = qt.findIndex((q:any) => q.size === size);
       if (sizeIdx >= 0) {
         qt[sizeIdx].tiers = qt[sizeIdx].tiers.filter((t: any) => t.min_qty !== min_qty);
         if (qt[sizeIdx].tiers.length === 0) qt.splice(sizeIdx, 1);
       }
       return { ...p, quantity_tiers: qt };
     });
  };

  const updateFlatTierPrice = (min_qty: number, newPrice: number) => {
    setProduct(p => ({
      ...p,
      quantity_tiers: (p.quantity_tiers || []).map((t: any) => 
        t.min_qty === min_qty ? { ...t, unit_price: newPrice } : t
      )
    }));
  };

  const updateMatrixTierPrice = (size: string, min_qty: number, newPrice: number) => {
    setProduct(p => ({
      ...p,
      quantity_tiers: (p.quantity_tiers || []).map((q: any) => 
        q.size === size ? {
          ...q,
          tiers: q.tiers.map((t: any) => 
            t.min_qty === min_qty ? { ...t, unit_price: newPrice } : t
          )
        } : q
      )
    }));
  };

  const addVariantImage = () => {
    if (!newVariantImage.image_url) return;
    setProduct(p => ({ ...p, variant_images: [...(p.variant_images || []), { ...newVariantImage }] }));
    setNewVariantImage({ size: "", color: "", image_url: "" });
  };
  const removeVariantImage = (idx: number) => setProduct(p => ({ ...p, variant_images: (p.variant_images || []).filter((_, i) => i !== idx) }));

  // ── Custom Variant Groups ──────────────────────────────────────────────────
  const [newGroup, setNewGroup] = useState<{ label: string; required: boolean }>({ label: "", required: true });
  const [newOption, setNewOption] = useState<{ [groupIdx: number]: string }>({});

  const addVariantGroup = () => {
    if (!newGroup.label.trim()) return;
    const group: CustomVariantGroup = { label: newGroup.label.trim(), required: newGroup.required, options: [] };
    setProduct(p => ({ ...p, custom_variants: [...(p.custom_variants || []), group] }));
    setNewGroup({ label: "", required: true });
  };
  const removeVariantGroup = (idx: number) =>
    setProduct(p => ({ ...p, custom_variants: (p.custom_variants || []).filter((_, i) => i !== idx) }));

  const addOptionToGroup = (groupIdx: number) => {
    const val = (newOption[groupIdx] || "").trim();
    if (!val) return;
    setProduct(p => {
      const cvs = [...(p.custom_variants || [])] as CustomVariantGroup[];
      cvs[groupIdx] = { ...cvs[groupIdx], options: [...cvs[groupIdx].options, val] };
      return { ...p, custom_variants: cvs };
    });
    setNewOption(o => ({ ...o, [groupIdx]: "" }));
  };
  const removeOptionFromGroup = (groupIdx: number, optIdx: number) =>
    setProduct(p => {
      const cvs = [...(p.custom_variants || [])] as CustomVariantGroup[];
      cvs[groupIdx] = { ...cvs[groupIdx], options: cvs[groupIdx].options.filter((_, i) => i !== optIdx) };
      return { ...p, custom_variants: cvs };
    });

  // ── Size-Color Availability ────────────────────────────────────────────────────
  const [sizeColorMode, setSizeColorMode] = useState<"all" | "per-size">(
    initialData?.size_color_availability && Object.keys(initialData.size_color_availability).length > 0
      ? "per-size" : "all"
  );

  const toggleSizeColorEntry = (size: string, colorName: string) => {
    setProduct(p => {
      const curr: Record<string, string[]> = { ...(p.size_color_availability || {}) };
      if (!curr[size]) curr[size] = (p.colors || []).map(c => c.name); // default all
      if (curr[size].includes(colorName)) {
        curr[size] = curr[size].filter(c => c !== colorName);
      } else {
        curr[size] = [...curr[size], colorName];
      }
      return { ...p, size_color_availability: curr };
    });
  };

  const initSizeColorMatrix = () => {
    // Pre-populate: every size gets all colors
    const map: Record<string, string[]> = {};
    (product.sizes || []).forEach(s => {
      map[s] = (product.colors || []).map(c => c.name);
    });
    setProduct(p => ({ ...p, size_color_availability: map }));
  };

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
                <label className="text-sm font-black text-gray-700 block">الألوان وتكلفة اللون (ضع 0 لجعله مجانياً)</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex gap-2 flex-1">
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
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                      placeholder="اسم اللون (أبيض، أسود...)"
                    />
                  </div>
                  <div className="flex gap-2 sm:w-[200px]">
                    <div className="relative w-full">
                       <input
                         type="number"
                         value={newColor.extra_cost || ""}
                         onChange={e => setNewColor(c => ({ ...c, extra_cost: Number(e.target.value) || 0 }))}
                         onKeyDown={e => {
                            if(e.key === "Enter") { e.preventDefault(); addColor(); }
                         }}
                         className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                         placeholder="سعر إضافي"
                       />
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">د.ج</span>
                    </div>
                    <button type="button" onClick={addColor} className="bg-primary/10 text-primary px-4 rounded-xl font-bold hover:bg-primary/20 transition-colors shrink-0">إضافة</button>
                  </div>
                </div>
                {product.colors && product.colors.length > 0 && (
                   <div className="flex flex-wrap gap-2 pt-2">
                     {product.colors.map(c => (
                       <span key={c.name} className="flex items-center gap-2 bg-gray-100/80 px-4 py-2 rounded-full text-sm font-bold text-gray-700">
                         <span className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: c.hex }} />
                         {c.name}
                         {c.extra_cost ? <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded-md text-[10px] font-black">(+{c.extra_cost} د.ج)</span> : <span className="bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-md text-[10px] font-bold">مجاني</span>}
                         <button type="button" onClick={() => removeColor(c.name)} className="text-gray-400 hover:text-red-500 bg-white rounded-full p-0.5"><X size={14} /></button>
                       </span>
                     ))}
                   </div>
                )}
              </div>

              {/* Quantity Tiers (Strict Order Amounts) */}
              <div className="space-y-4 pt-6 border-t border-gray-50">
                 <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
                   <label className="text-sm font-black text-gray-900 flex items-center gap-2">
                      <Tag size={16} className="text-primary" /> التسعير بالكمية
                   </label>
                   <div className="flex bg-gray-100 p-1 rounded-xl self-start xl:self-auto">
                      <button 
                        type="button" 
                        onClick={() => { setPricingMode("flat"); setProduct(p => ({...p, quantity_tiers: []})) }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${pricingMode === "flat" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                      >
                         تسعير موحد للكميات
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setPricingMode("matrix"); setProduct(p => ({...p, quantity_tiers: []})) }}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${pricingMode === "matrix" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700"}`}
                      >
                         تسعير المصفوفة (لكل مقاس)
                      </button>
                   </div>
                 </div>

                 <p className="text-xs text-gray-500 font-medium bg-blue-50 p-3 rounded-xl border border-blue-100/50">
                   ملاحظة: النظام سيسمح للزبون بالاختيار فقط من بين هذه الكميات المحددة.
                 </p>
                 
                 {pricingMode === "flat" ? (
                   <>
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
                          onClick={addFlatTier} 
                          className="self-end bg-gray-900 text-white px-6 h-[50px] rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                        >
                          إضافة
                        </button>
                      </div>
                      {product.quantity_tiers && product.quantity_tiers.length > 0 && (
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                           {product.quantity_tiers.map((tier:any, idx: number) => (
                             <div key={tier.min_qty || idx} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group hover:border-primary/30 transition-all">
                               <div>
                                  <span className="text-[10px] font-black text-gray-400 block uppercase">كمية محددة</span>
                                  <span className="font-black text-gray-900">{tier.min_qty} قطعة</span>
                               </div>
                               <div className="flex items-center gap-4">
                                 <div className="text-left flex flex-col items-end">
                                    <span className="text-[10px] font-black text-gray-400 block uppercase">السعر</span>
                                    <div className="flex items-center gap-1" dir="ltr">
                                       <span className="font-black text-primary text-sm mt-0.5">د.ج</span>
                                       <input
                                         type="number"
                                         value={tier.unit_price === 0 ? "" : tier.unit_price}
                                         onChange={e => updateFlatTierPrice(tier.min_qty, Number(e.target.value))}
                                         className="w-16 bg-blue-50/50 border border-transparent hover:border-primary/30 focus:border-primary focus:bg-white rounded px-1 py-0.5 text-center font-black text-primary outline-none transition-all text-base"
                                         dir="ltr"
                                       />
                                    </div>
                                 </div>
                                 <button type="button" onClick={() => removeFlatTier(tier.min_qty)} className="w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white">
                                    <X size={14} />
                                 </button>
                               </div>
                             </div>
                           ))}
                         </div>
                      )}
                   </>
                 ) : (
                   <>
                      <div className="flex flex-col gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase pr-1">تحديد المقاس المستهدف</label>
                          <select 
                             value={matrixSizeSelection} 
                             onChange={e => setMatrixSizeSelection(e.target.value)}
                             className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold text-primary"
                          >
                             <option value="">اختر مقاساً لبناء مصفوفة التسعير الخاصة به...</option>
                             {product.sizes?.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase pr-1">الكمية</label>
                            <input
                              type="number"
                              value={newTier.min_qty || ""}
                              onChange={e => setNewTier(p => ({ ...p, min_qty: Number(e.target.value) }))}
                              className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold text-gray-900"
                            />
                          </div>
                          <div className="flex-1 space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase pr-1">سعر القطعة (د.ج)</label>
                            <input
                              type="number"
                              value={newTier.unit_price || ""}
                              onChange={e => setNewTier(p => ({ ...p, unit_price: Number(e.target.value) }))}
                              className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-black text-primary"
                            />
                          </div>
                          <button 
                            type="button" 
                            onClick={addMatrixTier} 
                            disabled={!matrixSizeSelection}
                            className="self-end bg-primary text-white px-6 h-[50px] rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center whitespace-nowrap"
                          >
                            مصفوفة +
                          </button>
                        </div>
                      </div>
                      
                      {product.quantity_tiers && product.quantity_tiers.length > 0 && (
                         <div className="space-y-4 pt-2">
                           {product.quantity_tiers.map((matrixObj:any, idx) => (
                              <div key={`${matrixObj.size}-${idx}`} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                                 <div className="bg-gray-100 p-3 flex justify-between items-center border-b border-gray-200">
                                    <span className="font-black text-gray-800 text-sm flex items-center gap-2">
                                       <Tag size={14} className="text-primary"/> مقاس: {matrixObj.size}
                                    </span>
                                 </div>
                                 <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                                    {matrixObj.tiers && matrixObj.tiers.map((tier:any, tIdx: number) => (
                                       <div key={`${tier.min_qty}-${tIdx}`} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 group">
                                          <div className="flex flex-col">
                                             <span className="text-[10px] font-black text-gray-400 uppercase">كمية محددة</span>
                                             <span className="font-black text-gray-900">{tier.min_qty}</span>
                                          </div>
                                          <div className="flex items-center gap-4">
                                            <div className="text-left flex flex-col items-end">
                                               <span className="text-[10px] font-black text-gray-400 uppercase">السعر</span>
                                               <div className="flex items-center gap-1" dir="ltr">
                                                  <span className="font-black text-primary text-sm mt-0.5">د.ج</span>
                                                  <input
                                                    type="number"
                                                    value={tier.unit_price === 0 ? "" : tier.unit_price}
                                                    onChange={e => updateMatrixTierPrice(matrixObj.size, tier.min_qty, Number(e.target.value))}
                                                    className="w-16 bg-blue-50/50 border border-transparent hover:border-primary/30 focus:border-primary focus:bg-white rounded px-1 py-0.5 text-center font-black text-primary outline-none transition-all text-base"
                                                    dir="ltr"
                                                  />
                                               </div>
                                            </div>
                                            <button type="button" onClick={() => removeMatrixTier(matrixObj.size, tier.min_qty)} className="w-8 h-8 flex items-center justify-center bg-white text-red-500 rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-all">
                                               <X size={14} />
                                            </button>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           ))}
                         </div>
                      )}
                   </>
                 )}
              </div>

                 {/* Printing Config */}
                 <div className="mt-8 p-5 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                    <label className="text-sm font-black text-gray-900 flex items-center justify-between">
                       <span className="flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> إعدادات طباعة Serigraphie</span>
                    </label>
                    <p className="text-[10px] text-gray-400 font-bold border-b border-gray-100 pb-2">سجل 0 في أي خيار هنا لإخفائه تماماً من واجهة اختيار الزبون (مثل طباعة Offset).</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Extra Color Price */}
                      <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                         <label className="text-xs font-black text-gray-700 flex flex-col gap-1">
                            سعر لون السيريغرافي الإضافي
                            <span className="text-[10px] text-gray-400 font-normal">هذا السعر للون الواحد (مثال: تصميم 3 ألوان سيضيف ضعف هذا السعر).</span>
                         </label>
                         <div className="relative">
                            <input 
                              type="number"
                              value={product.printing_config?.extra_color_price || 0}
                              onChange={e => setProduct(p => ({
                                ...p, 
                                printing_config: { ...p.printing_config, extra_color_price: Number(e.target.value) }
                              }))}
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-black focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">د.ج / للون</span>
                         </div>
                      </div>

                      {/* Double Sided Price */}
                      <div className="space-y-2 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                         <label className="text-xs font-black text-gray-700 flex flex-col gap-1">
                            سعر الطباعة على جهتين
                            <span className="text-[10px] text-gray-400 font-normal">السعر المضاف عند اختيار طباعة من الجهتين (لكل لون).</span>
                         </label>
                         <div className="relative">
                            <input 
                              type="number"
                              value={product.printing_config?.double_sided_price || 0}
                              onChange={e => setProduct(p => ({
                                ...p, 
                                printing_config: { ...p.printing_config, double_sided_price: Number(e.target.value) }
                              }))}
                              className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm font-black focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">د.ج / للون</span>
                         </div>
                      </div>
                    </div>
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
                          className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        >
                           <option value="">المقاس...</option>
                           {product.sizes?.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select 
                          value={newVariantImage.color}
                          onChange={e => setNewVariantImage(v => ({...v, color: e.target.value}))}
                          className="w-full bg-white border border-gray-200 rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-primary/20 outline-none"
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
                       className="w-full bg-primary/10 text-primary py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/20 transition-all font-bold"
                     >
                        <Plus size={16} /> تثبيت صورة المتغير
                     </button>
                  </div>

                  {product.variant_images && product.variant_images.length > 0 && (
                    <div className="grid grid-cols-1 gap-2">
                       {product.variant_images.map((vi, idx) => (
                         <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm group hover:border-primary/20 transition-all">
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

      {/* ======== FULL WIDTH: Custom Variants + Size-Color Matrix ======== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Custom Variant Groups Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
           <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                 <Sliders size={20} className="text-primary" />
                 خيارات إضافية للمنتج
              </h2>
              <span className="text-[10px] bg-blue-50 text-blue-600 font-black px-3 py-1 rounded-full border border-blue-100">لا تؤثّر على السعر</span>
           </div>
           <p className="text-xs text-gray-500 font-medium bg-amber-50 p-3 rounded-xl border border-amber-100">
              مثال: نوع التشطيب (Matte / Glossy)، نوع الحبل (قطني / كلاسيكي)... الزبون يختار دون أي تغيير في السعر.
           </p>
           <div className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="flex-1 space-y-1">
                 <label className="text-[10px] font-black text-gray-400 uppercase pr-1">اسم مجموعة الخيار</label>
                 <input type="text" value={newGroup.label}
                   onChange={e => setNewGroup(g => ({ ...g, label: e.target.value }))}
                   onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addVariantGroup(); } }}
                   className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none"
                   placeholder="مثال: نوع التشطيب" />
              </div>
              <div className="flex items-end gap-3">
                 <label className="flex items-center gap-2 pb-3 cursor-pointer select-none">
                    <input type="checkbox" checked={newGroup.required}
                      onChange={e => setNewGroup(g => ({ ...g, required: e.target.checked }))}
                      className="w-4 h-4 accent-primary rounded" />
                    <span className="text-xs font-bold text-gray-700">إجباري</span>
                 </label>
                 <button type="button" onClick={addVariantGroup}
                   className="bg-gray-900 text-white px-5 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95 whitespace-nowrap text-sm">
                   + إضافة مجموعة
                 </button>
              </div>
           </div>
           {product.custom_variants && product.custom_variants.length > 0 && (
              <div className="space-y-4">
                 {product.custom_variants.map((group, gIdx) => (
                    <div key={`grp-${gIdx}-${group.label}`} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                       <div className="bg-gray-50 p-4 flex items-center justify-between border-b border-gray-200">
                          <div className="flex items-center gap-3">
                             <Sliders size={15} className="text-primary shrink-0" />
                             <span className="font-black text-gray-900 text-sm">{group.label}</span>
                             {group.required && <span className="text-[10px] bg-primary/10 text-primary font-black px-2 py-0.5 rounded-full">إجباري</span>}
                          </div>
                          <button type="button" onClick={() => removeVariantGroup(gIdx)}
                            className="w-8 h-8 flex items-center justify-center bg-white text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-sm">
                             <X size={14} />
                          </button>
                       </div>
                       <div className="p-4 bg-white space-y-3">
                          {group.options.length > 0 ? (
                             <div className="flex flex-wrap gap-2">
                                {group.options.map((opt, oIdx) => (
                                   <span key={`opt-${gIdx}-${oIdx}`} className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/20 px-3 py-1.5 rounded-full text-sm font-bold">
                                      {opt}
                                      <button type="button" onClick={() => removeOptionFromGroup(gIdx, oIdx)} className="text-primary/60 hover:text-red-500 transition-colors"><X size={12} /></button>
                                   </span>
                                ))}
                             </div>
                          ) : (
                             <p className="text-xs text-gray-400 italic">لا توجد خيارات — أضف خياراً أدناه</p>
                          )}
                          <div className="flex gap-2 pt-1">
                             <input type="text" value={newOption[gIdx] || ""}
                               onChange={e => setNewOption(o => ({ ...o, [gIdx]: e.target.value }))}
                               onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addOptionToGroup(gIdx); } }}
                               className="flex-1 bg-gray-50 border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                               placeholder={`خيار جديد لـ "${group.label}"...`} />
                             <button type="button" onClick={() => addOptionToGroup(gIdx)}
                               className="bg-primary/10 text-primary px-4 rounded-xl font-bold hover:bg-primary/20 transition-colors text-sm">
                                إضافة
                             </button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </div>

        {/* Size-Color Availability Card */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
           <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                 <Tag size={20} className="text-primary" />
                 توفر الألوان حسب المقاس
              </h2>
           </div>

           {/* Mode Toggle */}
           <div className="flex bg-gray-100 p-1 rounded-xl">
              <button type="button"
                onClick={() => { setSizeColorMode("all"); setProduct(p => ({...p, size_color_availability: {}})); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${ sizeColorMode === "all" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700" }`}>
                كل الألوان متاحة لكل المقاسات
              </button>
              <button type="button"
                onClick={() => { setSizeColorMode("per-size"); initSizeColorMatrix(); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${ sizeColorMode === "per-size" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-700" }`}>
                تحديد ألوان لكل مقاس بشكل مستقل
              </button>
           </div>

           {sizeColorMode === "all" ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
                 <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                    <Plus size={28} className="text-green-500" />
                 </div>
                 <p className="font-bold text-gray-700">كل الألوان متاحة لجميع المقاسات</p>
                 <p className="text-xs text-gray-400">اختر وضع “تحديد ألوان” إذا كانت بعض الألوان غير متاحة لمقاسات معينة</p>
              </div>
           ) : (
              <>
                {(!product.sizes || product.sizes.length === 0 || !product.colors || product.colors.length === 0) ? (
                   <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
                      <p className="text-sm font-bold text-amber-700">يجب إضافة المقاسات والألوان أولاً من قسم الخصائص</p>
                   </div>
                ) : (
                   <div className="space-y-4 overflow-y-auto max-h-[500px] pl-1">
                      {product.sizes?.map(size => {
                         const availableColors = product.size_color_availability?.[size]
                           ?? (product.colors || []).map(c => c.name);
                         return (
                            <div key={size} className="border border-gray-200 rounded-2xl overflow-hidden">
                               <div className="bg-gray-50 px-4 py-3 flex items-center gap-2 border-b border-gray-100">
                                  <Tag size={13} className="text-primary" />
                                  <span className="font-black text-gray-900 text-sm">مقاس: {size}</span>
                                  <span className="mr-auto text-[10px] text-gray-400 font-bold">{availableColors.length} / {product.colors?.length} لون</span>
                               </div>
                               <div className="p-3 flex flex-wrap gap-2">
                                  {product.colors?.map(color => {
                                     const isAvail = availableColors.includes(color.name);
                                     return (
                                        <button
                                          type="button"
                                          key={color.name}
                                          onClick={() => toggleSizeColorEntry(size, color.name)}
                                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all ${
                                            isAvail
                                              ? "border-primary bg-primary/10 text-primary"
                                              : "border-gray-200 bg-gray-50 text-gray-400 line-through"
                                          }`}
                                        >
                                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color.hex }} />
                                          {color.name}
                                          {isAvail ? <span className="text-green-500">✓</span> : <X size={10} />}
                                        </button>
                                     );
                                  })}
                               </div>
                            </div>
                         );
                      })}
                   </div>
                )}
              </>
           )}
        </div>

      </div>

    </form>
  );
}
