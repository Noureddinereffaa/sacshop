"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Palette, 
  MessageSquare, 
  Save, 
  Loader2, 
  Globe, 
  Mail,
  CheckCircle2,
  Tag,
  BarChart2,
  Trash2,
  Crown,
  Zap,
  Image as ImageIcon,
  Users,
  FileText
} from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";
import PoliciesEditor from "./components/PoliciesEditor";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"branding" | "offers" | "marketing" | "navigation" | "promobar" | "slider" | "partners" | "popup" | "policies">("branding");
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    
    // Fetch Settings
    const { data: settingsData } = await supabase.from("settings").select("*");
    const settingsMap = (settingsData || []).reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    
    if (!settingsMap.discounts) settingsMap.discounts = {};
    if (!settingsMap.discounts.advancedRules) settingsMap.discounts.advancedRules = [];
    
    setSettings(settingsMap);
    
    // Fetch Products
    const { data: productsData } = await supabase.from("products").select("id, name, price").order("created_at", { ascending: false });
    setProducts(productsData || []);
    
    setIsLoading(false);
  }

  const saveSettings = async () => {
    if (!supabase) return;
    setIsSaving(true);
    try {
      for (const key of Object.keys(settings)) {
        await supabase.from("settings").upsert({ key, value: settings[key] });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-20 text-center font-bold text-gray-400">جاري تحميل الإعدادات...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-black text-gray-900">إعدادات النظام</h1>
           <p className="text-gray-500 font-medium">تحكم في هوية المتجر والأسعار والخصومات</p>
        </div>
        <button 
          onClick={saveSettings}
          disabled={isSaving}
          className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50"
        >
           {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
           <span>{isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-xl flex items-center gap-2 font-bold animate-in fade-in slide-in-from-top-4">
           <CheckCircle2 size={20} />
           تم حفظ جميع الإعدادات بنجاح
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
         {/* Tabs */}
          <div className="space-y-2 flex flex-col max-h-[80vh] overflow-y-auto pr-2 custom-scrollbar">
            {[
               { id: "branding", name: "الهوية والتواصل", icon: Palette },
               { id: "navigation", name: "قائمة الخدمات", icon: Globe },
               { id: "slider", name: "سلايدر الرئيسية", icon: ImageIcon },
               { id: "partners", name: "شركاء النجاح", icon: Users },
               { id: "promobar", name: "شريط العروض", icon: Zap },
               { id: "offers", name: "المستويات والولاء", icon: Tag },
               { id: "popup", name: "نافذة العروض", icon: Zap },
               { id: "marketing", name: "بيكسلات التتبع", icon: BarChart2 },
               { id: "policies", name: "الصفحات القانونية", icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl font-bold transition-all ${activeTab === tab.id ? "bg-white text-primary shadow-lg border border-gray-100" : "text-gray-400 hover:bg-gray-100"}`}
              >
                <tab.icon size={20} />
                <span>{tab.name}</span>
              </button>
            ))}
         </div>

         {/* Tab Content */}
         <div className="lg:col-span-3">
            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-xl space-y-8">
                {activeTab === "slider" && (
                  <div className="space-y-8 animate-in fade-in duration-500 text-right">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800 text-xl">إدارة سلايدر الصفحة الرئيسية</h3>
                      <button 
                         onClick={() => {
                           const sld = settings.slider || [];
                           setSettings({ ...settings, slider: [...sld, { id: Date.now(), title: "عنوان السلايدر الجديد", subtitle: "وصف الخدمة هنا", buttonText: "تصفح المنتجات", image: "", link: "/products" }] });
                         }}
                         className="bg-primary/10 text-primary px-5 py-3 rounded-xl font-black hover:bg-primary/20 transition-all flex items-center gap-2"
                      >
                         <span>+ إضافة شريحة جديدة</span>
                      </button>
                    </div>

                    <div className="space-y-6">
                      {(settings.slider || []).map((slide: any, idx: number) => (
                        <div key={slide.id || idx} className="bg-gray-50 border border-gray-100 rounded-[2rem] p-8 space-y-6 relative overflow-hidden">
                           <button 
                             onClick={() => {
                               const sld = settings.slider.filter((_: any, i: number) => i !== idx);
                               setSettings({ ...settings, slider: sld });
                             }}
                             className="absolute top-6 left-6 text-red-400 hover:text-red-600 p-2 bg-white rounded-xl shadow-sm transition-all"
                           >
                              <Trash2 size={18} />
                           </button>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الصورة (المقاس المثالي 2000x800)</label>
                                  <ImageUploader 
                                    value={slide.image}
                                    onChange={(url) => {
                                      const sld = [...settings.slider];
                                      sld[idx].image = url;
                                      setSettings({ ...settings, slider: sld });
                                    }}
                                    placeholder="رفع صورة السلايدر..."
                                    label=""
                                  />
                                </div>
                              </div>
                              <div className="space-y-4">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">العنوان الرئيسي</label>
                                    <input 
                                       type="text"
                                       value={slide.title}
                                       onChange={(e) => {
                                         const sld = [...settings.slider];
                                         sld[idx].title = e.target.value;
                                         setSettings({ ...settings, slider: sld });
                                       }}
                                       className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none uppercase"
                                    />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الوصف الفرعي</label>
                                    <input 
                                       type="text"
                                       value={slide.subtitle}
                                       onChange={(e) => {
                                         const sld = [...settings.slider];
                                         sld[idx].subtitle = e.target.value;
                                         setSettings({ ...settings, slider: sld });
                                       }}
                                       className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 font-medium text-gray-600 focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                 </div>
                                 <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">نص الزر</label>
                                       <input 
                                          type="text"
                                          value={slide.buttonText}
                                          onChange={(e) => {
                                            const sld = [...settings.slider];
                                            sld[idx].buttonText = e.target.value;
                                            setSettings({ ...settings, slider: sld });
                                          }}
                                          className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none"
                                       />
                                    </div>
                                    <div className="space-y-2">
                                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الرابط</label>
                                       <input 
                                          type="text"
                                          value={slide.link}
                                          dir="ltr"
                                          onChange={(e) => {
                                            const sld = [...settings.slider];
                                            sld[idx].link = e.target.value;
                                            setSettings({ ...settings, slider: sld });
                                          }}
                                          className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                                       />
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                      ))}

                      {(settings.slider || []).length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                           <ImageIcon size={48} className="text-gray-200 mx-auto mb-4" />
                           <p className="text-gray-400 font-bold">لم تقم بإضافة أي شرائح سلايدر بعد.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "partners" && (
                  <div className="space-y-8 animate-in fade-in duration-500 text-right">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-800 text-xl">إدارة شركاء النجاح</h3>
                      <button 
                         onClick={() => {
                           const prt = settings.partners || [];
                           setSettings({ ...settings, partners: [...prt, { name: "اسم الشركة", logo: "" }] });
                         }}
                         className="bg-primary/10 text-primary px-5 py-3 rounded-xl font-black hover:bg-primary/20 transition-all flex items-center gap-2"
                      >
                         <span>+ إضافة شريك جديد</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                       {(settings.partners || []).map((partner: any, idx: number) => (
                         <div key={idx} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 space-y-4 group relative">
                            <button 
                               onClick={() => {
                                 const prt = settings.partners.filter((_: any, i: number) => i !== idx);
                                 setSettings({ ...settings, partners: prt });
                               }}
                               className="absolute -top-2 -right-2 bg-white text-red-300 hover:text-red-500 p-2 rounded-xl shadow-lg border border-gray-50 opacity-0 group-hover:opacity-100 transition-all z-10"
                            >
                               <Trash2 size={16} />
                            </button>
                            
                            <div className="bg-white rounded-2xl h-32 flex items-center justify-center p-4 shadow-sm border border-gray-50">
                               {partner.logo ? (
                                 <img src={partner.logo} alt={partner.name} className="max-h-full max-w-full object-contain" />
                               ) : (
                                 <Users size={32} className="text-gray-100" />
                               )}
                            </div>

                            <div className="space-y-3">
                               <input 
                                 type="text"
                                 value={partner.name}
                                 onChange={(e) => {
                                   const prt = [...settings.partners];
                                   prt[idx].name = e.target.value;
                                   setSettings({ ...settings, partners: prt });
                                 }}
                                 placeholder="اسم الشريك..."
                                 className="w-full bg-white border border-gray-100 rounded-xl py-2 px-3 text-center font-bold text-gray-900 text-sm focus:ring-2 focus:ring-primary/10 outline-none"
                               />
                               <ImageUploader 
                                 value={partner.logo}
                                 onChange={(url) => {
                                   const prt = [...settings.partners];
                                   prt[idx].logo = url;
                                   setSettings({ ...settings, partners: prt });
                                 }}
                                 label=""
                                 placeholder="رفع شعار الشريك..."
                               />
                            </div>
                         </div>
                       ))}
                    </div>

                    {(settings.partners || []).length === 0 && (
                        <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200 col-span-full">
                           <Users size={48} className="text-gray-200 mx-auto mb-4" />
                           <p className="text-gray-400 font-bold">لم تقم بإضافة أي شركاء نجاح بعد.</p>
                        </div>
                    )}
                  </div>
                )}

                {activeTab === "popup" && (
                  <div className="space-y-10 animate-in fade-in duration-500 text-right">
                    <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                      <div>
                        <h3 className="font-black text-gray-900 text-xl">إدارة النافذة المنبثقة (Popup)</h3>
                        <p className="text-gray-500 text-sm mt-1">تظهر للزوار عند دخول الموقع للإعلان عن عروض خاصة</p>
                      </div>
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-bold text-gray-400">حالة النافذة:</span>
                         <button 
                           onClick={() => setSettings({ ...settings, popup_offer: { ...settings.popup_offer, enabled: !settings.popup_offer?.enabled } })}
                           className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${settings.popup_offer?.enabled ? "bg-green-500 text-white shadow-lg shadow-green-100" : "bg-gray-100 text-gray-400"}`}
                         >
                           {settings.popup_offer?.enabled ? "نشطة الآن" : "متوقفة"}
                         </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div className="space-y-3">
                           <label className="text-sm font-black text-gray-700 block mr-2">العنوان الجذاب (Title)</label>
                           <input 
                             type="text"
                             value={settings.popup_offer?.title || ""}
                             onChange={(e) => setSettings({ ...settings, popup_offer: { ...settings.popup_offer, title: e.target.value } })}
                             placeholder="مثال: خصم 20% لفترة محدودة!"
                             className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none"
                           />
                        </div>

                        <div className="space-y-3">
                           <label className="text-sm font-black text-gray-700 block mr-2">وصف العرض (Description)</label>
                           <textarea 
                             value={settings.popup_offer?.description || ""}
                             onChange={(e) => setSettings({ ...settings, popup_offer: { ...settings.popup_offer, description: e.target.value } })}
                             placeholder="اكتب تفاصيل العرض هنا..."
                             rows={3}
                             className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                           />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-3">
                              <label className="text-sm font-black text-gray-700 block mr-2">نص الزر</label>
                              <input 
                                type="text"
                                value={settings.popup_offer?.buttonText || "اطلب الآن"}
                                onChange={(e) => setSettings({ ...settings, popup_offer: { ...settings.popup_offer, buttonText: e.target.value } })}
                                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none"
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-sm font-black text-gray-700 block mr-2">رابط التوجه</label>
                              <input 
                                type="text"
                                dir="ltr"
                                value={settings.popup_offer?.buttonLink || "/products"}
                                onChange={(e) => setSettings({ ...settings, popup_offer: { ...settings.popup_offer, buttonLink: e.target.value } })}
                                className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-mono text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                              />
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-sm font-black text-gray-700 block mr-2">توقيت الظهور (بالثواني)</label>
                           <input 
                             type="number"
                             min="0"
                             max="60"
                             value={(settings.popup_offer?.delay || 2000) / 1000}
                             onChange={(e) => setSettings({ ...settings, popup_offer: { ...settings.popup_offer, delay: parseInt(e.target.value) * 1000 } })}
                             className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none"
                           />
                           <p className="text-[10px] text-gray-400 font-bold mr-2">الوقت المستغرق قبل ظهور النافذة للزائر</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                         <div className="space-y-3">
                            <label className="text-sm font-black text-gray-700 block mr-2">صورة العرض (اختياري)</label>
                            <div className="aspect-[4/5] bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 overflow-hidden flex items-center justify-center">
                               {settings.popup_offer?.image ? (
                                 <img src={settings.popup_offer.image} className="w-full h-full object-cover" alt="preview" />
                               ) : (
                                 <ImageIcon size={48} className="text-gray-200" />
                               )}
                            </div>
                            <ImageUploader 
                              value={settings.popup_offer?.image || ""}
                              onChange={(url) => setSettings({ ...settings, popup_offer: { ...settings.popup_offer, image: url } })}
                              label=""
                              placeholder="رفع صورة جذابة للعرض..."
                            />
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "promobar" && (
                  <div className="space-y-8 animate-in fade-in duration-500 text-right">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="font-bold text-gray-800">إعدادات شريط العروض العلوي</h3>
                       <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400">حالة الشريط:</span>
                          <button 
                            onClick={() => setSettings({ ...settings, promobar: { ...settings.promobar, enabled: !settings.promobar?.enabled } })}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${settings.promobar?.enabled ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"}`}
                          >
                            {settings.promobar?.enabled ? "مفعّل" : "معطّل"}
                          </button>
                       </div>
                    </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                        <div className="space-y-3">
                           <label className="text-sm font-black text-gray-700 block mr-2">لون الخلفية (مستطيل العروض)</label>
                           <div className="flex gap-4 items-center">
                              <input 
                                type="color" 
                                value={settings.promobar?.bgColor || "#00AEEF"}
                                onChange={(e) => setSettings({ ...settings, promobar: { ...settings.promobar, bgColor: e.target.value } })}
                                className="w-12 h-12 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                              />
                              <input 
                                type="text" 
                                value={settings.promobar?.bgColor || "#00AEEF"}
                                dir="ltr"
                                className="flex-1 bg-gray-50 border-none rounded-xl py-3 px-4 font-bold text-gray-600"
                                readOnly
                              />
                           </div>
                        </div>

                        <div className="space-y-3">
                           <label className="text-sm font-black text-gray-700 block mr-2">موقع شريط العروض</label>
                           <div className="bg-gray-50 p-1.5 rounded-2xl flex gap-1">
                              <button 
                                onClick={() => setSettings({ ...settings, promobar: { ...settings.promobar, position: 'top' } })}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${settings.promobar?.position === 'top' || !settings.promobar?.position ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                              >
                                فوق الهيدر
                              </button>
                              <button 
                                onClick={() => setSettings({ ...settings, promobar: { ...settings.promobar, position: 'bottom' } })}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${settings.promobar?.position === 'bottom' ? "bg-white text-primary shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                              >
                                تحت الهيدر
                              </button>
                           </div>
                        </div>
                     </div>

                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <label className="text-sm font-black text-gray-700">أزرار الشريط (Buttons)</label>
                          <button 
                            onClick={() => {
                              const btns = settings.promobar?.buttons || [];
                              setSettings({ ...settings, promobar: { ...settings.promobar, buttons: [...btns, { label: "زر جديد", link: "/", color: "green", position: "right" }] } });
                            }}
                            className="text-primary text-xs font-bold hover:underline"
                          >
                            + إضافة زر إضافي
                          </button>
                       </div>
                       
                       {(settings.promobar?.buttons || [
                         { label: "إذا كنت صاحب صيدلية اضغط هنا", link: "/products?category=pharmacy", color: "green", position: "right" },
                         { label: "العروض والتخفيضات", link: "/offers", color: "white", position: "left" }
                       ]).map((btn: any, idx: number) => (
                         <div key={idx} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col gap-4 text-right" dir="rtl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase">نص الزر</label>
                                  <input 
                                    type="text" 
                                    value={btn.label}
                                    onChange={(e) => {
                                      const btns = [...(settings.promobar?.buttons || [
                                        { label: "إذا كنت صاحب صيدلية اضغط هنا", link: "/products?category=pharmacy", color: "green", position: "right" },
                                        { label: "العروض والتخفيضات", link: "/offers", color: "white", position: "left" }
                                      ])];
                                      btns[idx] = { ...btns[idx], label: e.target.value };
                                      setSettings({ ...settings, promobar: { ...settings.promobar, buttons: btns } });
                                    }}
                                    className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 font-bold text-sm"
                                  />
                                </div>
                               <div className="space-y-2">
                                  <label className="text-[10px] font-black text-gray-400 uppercase">الرابط (Link)</label>
                                  <input 
                                    type="text" 
                                    list={`promobar-links-${idx}`}
                                    value={btn.link}
                                    dir="ltr"
                                    onChange={(e) => {
                                      const btns = [...(settings.promobar?.buttons || [
                                        { label: "إذا كنت صاحب صيدلية اضغط هنا", link: "/products?category=pharmacy", color: "green", position: "right" },
                                        { label: "العروض والتخفيضات", link: "/offers", color: "white", position: "left" }
                                      ])];
                                      btns[idx] = { ...btns[idx], link: e.target.value };
                                      setSettings({ ...settings, promobar: { ...settings.promobar, buttons: btns } });
                                    }}
                                    className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 font-mono text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                                    placeholder="أدخل الرابط أو اختر من القائمة..."
                                  />
                                  <datalist id={`promobar-links-${idx}`}>
                                    {settings.navigation?.map((navItem: any, i: number) => (
                                      <option key={i} value={navItem.link}>{navItem.name}</option>
                                    ))}
                                    <option value="/offers">صفحة العروض</option>
                                    <option value="/products">كل المنتجات</option>
                                  </datalist>
                               </div>
                            </div>
                            <div className="flex items-center justify-between">
                               <div className="flex gap-4">
                                  <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-black text-gray-400">اللون:</span>
                                     <select 
                                       value={btn.color}
                                       onChange={(e) => {
                                         const btns = [...(settings.promobar?.buttons || [
                                           { label: "إذا كنت صاحب صيدلية اضغط هنا", link: "/products?category=pharmacy", color: "green", position: "right" },
                                           { label: "العروض والتخفيضات", link: "/offers", color: "white", position: "left" }
                                         ])];
                                         btns[idx] = { ...btns[idx], color: e.target.value };
                                         setSettings({ ...settings, promobar: { ...settings.promobar, buttons: btns } });
                                       }}
                                       className="bg-white border text-xs p-1 rounded-md"
                                     >
                                        <option value="green">أخضر (Pharmacy)</option>
                                        <option value="white">أبيض (Offers)</option>
                                        <option value="primary">اللون الأساسي</option>
                                     </select>
                                  </div>
                                  <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-black text-gray-400">الموضع:</span>
                                     <select 
                                       value={btn.position}
                                       onChange={(e) => {
                                         const btns = [...(settings.promobar?.buttons || [
                                           { label: "إذا كنت صاحب صيدلية اضغط هنا", link: "/products?category=pharmacy", color: "green", position: "right" },
                                           { label: "العروض والتخفيضات", link: "/offers", color: "white", position: "left" }
                                         ])];
                                         btns[idx] = { ...btns[idx], position: e.target.value };
                                         setSettings({ ...settings, promobar: { ...settings.promobar, buttons: btns } });
                                       }}
                                       className="bg-white border text-xs p-1 rounded-md"
                                     >
                                        <option value="right">يمين</option>
                                        <option value="left">يسار</option>
                                     </select>
                                  </div>
                               </div>
                               <button 
                                 onClick={() => {
                                   const btns = [...(settings.promobar?.buttons || [
                                     { label: "إذا كنت صاحب صيدلية اضغط هنا", link: "/products?category=pharmacy", color: "green", position: "right" },
                                     { label: "العروض والتخفيضات", link: "/offers", color: "white", position: "left" }
                                   ])].filter((_: any, i: number) => i !== idx);
                                   setSettings({ ...settings, promobar: { ...settings.promobar, buttons: btns } });
                                 }}
                                 className="text-red-400 hover:text-red-600 transition-colors"
                               >
                                 <Trash2 size={16} />
                               </button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {activeTab === "branding" && (
                 <div className="space-y-10 animate-in fade-in duration-500">
                   
                   {/* ── Section 1: Store Identity ── */}
                   <div className="space-y-4">
                     <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                       <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                         <Palette size={16} />
                       </div>
                       <h3 className="font-black text-gray-800">هوية المتجر</h3>
                     </div>
                     <div className="space-y-3">
                       <label className="text-sm font-black text-gray-700 block">اسم المتجر</label>
                       <input 
                         type="text" 
                         value={settings.branding?.storeName || ""}
                         onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, storeName: e.target.value } })}
                         className="w-full bg-gray-50 border-none rounded-2xl py-4 px-5 font-bold text-gray-900 text-lg focus:ring-2 focus:ring-primary/20 outline-none"
                         placeholder="اسم المتجر..."
                       />
                     </div>
                   </div>

                   {/* ── Section 2: Color Palette ── */}
                   <div className="space-y-4">
                     <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                       <div className="w-8 h-8 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                         <span className="text-sm font-black">🎨</span>
                       </div>
                       <h3 className="font-black text-gray-800">لوحة الألوان</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-gray-50 p-5 rounded-2xl space-y-3">
                         <label className="text-sm font-black text-gray-700 block">اللون الأساسي (Primary)</label>
                         <div className="flex gap-4 items-center">
                           <div className="relative">
                             <input 
                               type="color" 
                               value={settings.branding?.primaryColor || "#00AEEF"}
                               onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, primaryColor: e.target.value } })}
                               className="w-14 h-14 rounded-xl cursor-pointer border-none p-0 bg-transparent"
                             />
                           </div>
                           <div className="flex-1">
                             <input 
                               type="text" 
                               value={settings.branding?.primaryColor || "#00AEEF"}
                               dir="ltr"
                               onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, primaryColor: e.target.value } })}
                               className="w-full bg-white border-none rounded-xl py-3 px-4 font-black text-gray-700 text-sm"
                             />
                             <p className="text-[10px] text-gray-400 font-bold mt-1 mr-1">يؤثر على الأزرار والروابط وعناصر التمييز</p>
                           </div>
                         </div>
                         <div className="h-2 rounded-full" style={{ background: settings.branding?.primaryColor || "#00AEEF" }} />
                       </div>
                       <div className="bg-gray-50 p-5 rounded-2xl space-y-3">
                         <label className="text-sm font-black text-gray-700 block">اللون الثانوي (Secondary)</label>
                         <div className="flex gap-4 items-center">
                           <div className="relative">
                             <input 
                               type="color" 
                               value={settings.branding?.secondaryColor || "#e6007e"}
                               onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, secondaryColor: e.target.value } })}
                               className="w-14 h-14 rounded-xl cursor-pointer border-none p-0 bg-transparent"
                             />
                           </div>
                           <div className="flex-1">
                             <input 
                               type="text" 
                               value={settings.branding?.secondaryColor || "#e6007e"}
                               dir="ltr"
                               onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, secondaryColor: e.target.value } })}
                               className="w-full bg-white border-none rounded-xl py-3 px-4 font-black text-gray-700 text-sm"
                             />
                             <p className="text-[10px] text-gray-400 font-bold mt-1 mr-1">يؤثر على العناصر التمييزية والشارات</p>
                           </div>
                         </div>
                         <div className="h-2 rounded-full" style={{ background: settings.branding?.secondaryColor || "#e6007e" }} />
                       </div>
                     </div>
                   </div>

                   {/* ── Section 3: Logos ── */}
                   <div className="space-y-4">
                     <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                       <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center">
                         <span className="text-sm">🖼️</span>
                       </div>
                       <h3 className="font-black text-gray-800">الشعارات (Logos)</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-3">
                         <label className="text-sm font-black text-gray-700 flex items-center justify-between">
                           شعار الهيدر (الشريط العلوي)
                           <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded-md">خلفية فاتحة</span>
                         </label>
                         <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 min-h-[60px] flex items-center justify-center">
                           {settings.branding?.logo ? (
                             <img src={settings.branding.logo} alt="header logo" className="max-h-12 object-contain" />
                           ) : (
                             <span className="text-gray-300 text-xs font-bold">لا يوجد شعار</span>
                           )}
                         </div>
                         <div className="bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden">
                           <ImageUploader 
                             value={settings.branding?.logo || ""} 
                             onChange={(url) => setSettings({ ...settings, branding: { ...settings.branding, logo: url } })}
                             label=""
                             placeholder="رفع شعار الهيدر..."
                           />
                         </div>
                       </div>
                       <div className="space-y-3">
                         <label className="text-sm font-black text-gray-700 flex items-center justify-between">
                           شعار الفوتر (الشريط السفلي)
                           <span className="text-[10px] text-gray-400 font-bold bg-gray-800 text-gray-300 px-2 py-1 rounded-md">خلفية داكنة</span>
                         </label>
                         <div className="bg-gray-900 p-4 rounded-2xl border border-gray-800 min-h-[60px] flex items-center justify-center">
                           {settings.branding?.footerLogo ? (
                             <img src={settings.branding.footerLogo} alt="footer logo" className="max-h-12 object-contain" />
                           ) : (
                             <span className="text-gray-600 text-xs font-bold">لا يوجد شعار (سيستخدم الهيدر تلقائياً)</span>
                           )}
                         </div>
                         <div className="bg-gray-50 rounded-3xl border border-gray-100 overflow-hidden">
                           <ImageUploader 
                             value={settings.branding?.footerLogo || ""} 
                             onChange={(url) => setSettings({ ...settings, branding: { ...settings.branding, footerLogo: url } })}
                             label=""
                             placeholder="رفع شعار الفوتر..."
                           />
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* ── Section 4: Contact & Communication ── */}
                   <div className="space-y-4">
                     <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                       <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                         <MessageSquare size={16} />
                       </div>
                       <h3 className="font-black text-gray-800">معلومات التواصل</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div className="space-y-2">
                         <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                           <span className="text-green-500">📱</span> رقم الواتساب الرئيسي
                         </label>
                         <div className="relative">
                           <input 
                             type="text" 
                             dir="ltr"
                             value={settings.branding?.whatsappNumber || "213"}
                             onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, whatsappNumber: e.target.value } })}
                             className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-4 pl-4 font-black text-gray-900 focus:ring-2 focus:ring-green-200 outline-none"
                             placeholder="2135XXXXXXXX"
                           />
                         </div>
                         <p className="text-[10px] text-gray-400 font-bold px-1">الصيغة الدولية بدون + (مثال: 213557123456)</p>
                         <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-xs text-green-700 font-bold">
                           ✅ يُستخدم في: زر الواتساب العائم + تأكيدات الطلبات + الفوتر
                         </div>
                       </div>
                       <div className="space-y-2">
                         <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                           <span>📧</span> البريد الإلكتروني
                         </label>
                         <input 
                           type="email" 
                           dir="ltr"
                           value={settings.branding?.contactEmail || ""}
                           onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, contactEmail: e.target.value } })}
                           className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none"
                           placeholder="support@yourstore.dz"
                         />
                       </div>
                       <div className="space-y-2 md:col-span-2">
                         <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                           <span>📍</span> العنوان / الولاية
                         </label>
                         <input 
                           type="text"
                           value={settings.branding?.address || ""}
                           onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, address: e.target.value } })}
                           className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none"
                           placeholder="مثال: الجزائر العاصمة، حيدرة"
                         />
                       </div>
                     </div>
                   </div>

                   {/* ── Section 5: Social Media ── */}
                   <div className="space-y-4">
                     <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                       <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
                         <span className="text-sm">🌐</span>
                       </div>
                       <h3 className="font-black text-gray-800">روابط التواصل الاجتماعي</h3>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                       <div className="space-y-2">
                         <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                           <span className="text-blue-600">📘</span> رابط Facebook
                         </label>
                         <input 
                           type="url" 
                           dir="ltr"
                           value={settings.branding?.facebookUrl || ""}
                           onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, facebookUrl: e.target.value } })}
                           className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                           placeholder="https://facebook.com/yourpage"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                           <span className="text-pink-600">📸</span> رابط Instagram
                         </label>
                         <input 
                           type="url" 
                           dir="ltr"
                           value={settings.branding?.instagramUrl || ""}
                           onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, instagramUrl: e.target.value } })}
                           className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-pink-200 outline-none text-sm"
                           placeholder="https://instagram.com/yourpage"
                         />
                       </div>
                     </div>
                   </div>

                 </div>
               )}

               {activeTab === "navigation" && (
                 <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex justify-between items-center mb-4">
                       <h3 className="font-bold text-gray-800">روابط القائمة العلوية (الخدمات)</h3>
                       <button 
                         onClick={() => {
                           const nav = settings.navigation || [];
                           setSettings({ ...settings, navigation: [...nav, { label: "خدمة جديدة", href: "/products" }] });
                         }}
                         className="bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/20 transition-all"
                       >
                         + إضافة رابط جديد
                       </button>
                    </div>

                    <div className="space-y-4">
                       {(settings.navigation || []).map((item: any, idx: number) => (
                         <div key={idx} className="flex gap-4 items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                            <div className="flex-1 space-y-2">
                               <input 
                                 type="text" 
                                 placeholder="اسم الخدمة"
                                 value={item.label}
                                 onChange={(e) => {
                                   const newLabel = e.target.value;
                                   const nav = [...settings.navigation];
                                   
                                   // Auto-update href only if it followed the previous label pattern
                                   const prevLabel = nav[idx].label;
                                   const expectedPrevHref = `/products?category=${encodeURIComponent(prevLabel)}`;
                                   
                                   nav[idx].label = newLabel;
                                   
                                   if (nav[idx].href === expectedPrevHref || nav[idx].href === "/products") {
                                      nav[idx].href = `/products?category=${encodeURIComponent(newLabel)}`;
                                   }
                                   
                                   setSettings({ ...settings, navigation: nav });
                                 }}
                                 className="w-full bg-white border-none rounded-lg py-2 px-3 font-bold text-gray-900 shadow-sm"
                               />
                               <input 
                                 type="text" 
                                 placeholder="الرابط (مثال: /products?category=stickers)"
                                 value={item.href}
                                 onChange={(e) => {
                                   const nav = [...settings.navigation];
                                   nav[idx].href = e.target.value;
                                   setSettings({ ...settings, navigation: nav });
                                 }}
                                 className="w-full bg-white border-none rounded-lg py-2 px-3 text-xs font-mono text-gray-500 shadow-sm"
                               />
                            </div>
                            <button 
                               onClick={() => {
                                 const nav = settings.navigation.filter((_: any, i: number) => i !== idx);
                                 setSettings({ ...settings, navigation: nav });
                               }}
                               className="text-red-400 hover:text-red-600 p-2"
                            >
                               <Trash2 size={20} />
                            </button>
                         </div>
                       ))}
                       
                       {(settings.navigation || []).length === 0 && (
                         <div className="text-center py-10 text-gray-400 italic">
                           لا توجد روابط مضافة حالياً. سيظهر رابط "كل الخدمات" تلقائياً.
                         </div>
                       )}
                    </div>
                 </div>
               )}

               {activeTab === "offers" && (
                 <div className="space-y-10 animate-in fade-in duration-500">
                    {/* Level/Star Loyalty Info */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex gap-5">
                       <Crown className="text-yellow-500 shrink-0" size={28} />
                       <div>
                          <h3 className="font-black text-yellow-800 mb-1">نظام نجوم الولاء (Loyalty Stars)</h3>
                          <p className="text-yellow-700 text-sm leading-relaxed">
                            يتم تصنيف الزبائن تلقائياً من نجمة واحدة (عند أول طلب) إلى 5 نجوم (عند 5 طلبات فما فوق). تستطيع التحكم في العروض لكل مستوى من صفحة <Link href="/admin/offers" className="underline font-black">إدارة العروض</Link>.
                          </p>
                       </div>
                    </div>

                    <div className="space-y-6">
                       <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                          <Tag className="text-primary" size={24} />
                          <h3 className="font-black text-gray-900 text-xl">خصم الترحيب (للزبائن الجدد فقط)</h3>
                       </div>

                       {/* Alert / Explanation Box */}
                       <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex gap-4">
                          <Tag className="text-primary shrink-0 mt-0.5" size={22} />
                          <div>
                            <h3 className="font-black text-gray-800 mb-1">كيف يعمل الخصم الترحيبي؟</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              يستهدف هذا الخصم <strong>الزبائن الجدد فقط</strong> لتشجيعهم على إتمام أول طلب. يمكنك تخصيص خصم معين لكل منتج (بالأسفل). أما المنتجات التي لم تُحدد لها خصماً مخصصاً، فسيُطبق عليها <strong>الخصم العام</strong> المحدد هنا تلقائياً، سواء كان الخصم العام عبارة عن نسبة مئوية (%) أو مبلغ ثابت يُخصم من كل قطعة.
                            </p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-sm font-black text-gray-700 block mr-2">حالة الخصم الترحيبي</label>
                             <select
                               value={settings.discounts?.newCustomerDiscountEnabled === false ? "false" : "true"}
                               onChange={(e) => setSettings({ ...settings, discounts: { ...settings.discounts, newCustomerDiscountEnabled: e.target.value === "true" } })}
                               className="w-full bg-gray-50 border-none rounded-xl py-4 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                             >
                               <option value="true">مفعل (يظهر للزبائن الجدد)</option>
                               <option value="false">معطل (مخفي للجميع)</option>
                             </select>
                          </div>
                           <div className="space-y-3">
                             <label className="text-sm font-black text-gray-700 block mr-2">نوع الخصم العام</label>
                             <select
                               value={settings.discounts?.newCustomerDiscountType || "percentage"}
                               onChange={(e) => setSettings({ ...settings, discounts: { ...settings.discounts, newCustomerDiscountType: e.target.value } })}
                               className="w-full bg-gray-50 border-none rounded-xl py-4 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                             >
                               <option value="percentage">نسبة مئوية من السعر (%)</option>
                               <option value="fixed">مبلغ ثابت لكل قطعة (د.ج)</option>
                             </select>
                           </div>
                           <div className="space-y-3">
                             <label className="text-sm font-black text-gray-700 block mr-2">قيمة الخصم العام</label>
                             <input 
                               type="number" 
                               min="0"
                               value={settings.discounts?.newCustomerDiscountPercent || 0}
                               onChange={(e) => setSettings({ ...settings, discounts: { ...settings.discounts, newCustomerDiscountPercent: parseInt(e.target.value) || 0 } })}
                               className="w-full bg-gray-50 border-none rounded-xl py-4 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                             />
                             <p className="text-[10px] text-gray-400 font-bold px-2">يُطبق على المنتجات التي ليس لها خصم مخصص أسفله (اجعلها 0 لإلغائها).</p>
                          </div>
                          <div className="space-y-3">
                             <label className="text-sm font-black text-gray-700 block mr-2">الحد الأدنى للمنتجات لتفعيل الخصم</label>
                             <input 
                               type="number" 
                               min="1"
                               value={settings.discounts?.newCustomerMinItems || 2}
                               onChange={(e) => setSettings({ ...settings, discounts: { ...settings.discounts, newCustomerMinItems: parseInt(e.target.value) || 1 } })}
                               className="w-full bg-gray-50 border-none rounded-xl py-4 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                             />
                          </div>
                       </div>
                       
                       {/* ── Advanced Rules for Specific Products ── */}
                       <div className="mt-8 border-t border-gray-100 pt-8 space-y-6">
                          <div className="flex justify-between items-center">
                             <h4 className="font-bold text-gray-800">تخصيص الخصم لمنتجات معينة</h4>
                             <button 
                               onClick={() => {
                                 const advancedRules = settings.discounts?.advancedRules || [];
                                 if (products.length > 0) {
                                   setSettings({ 
                                     ...settings, 
                                     discounts: { 
                                       ...settings.discounts, 
                                       advancedRules: [...advancedRules, { productId: products[0].id, discountType: 'percentage', discountValue: 15 }] 
                                     } 
                                   });
                                 }
                               }}
                               className="text-primary text-xs font-bold hover:underline"
                             >
                               + إضافة منتج مخصص
                             </button>
                          </div>

                          {(settings.discounts?.advancedRules || []).map((rule: any, idx: number) => (
                             <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
                                <div className="flex-1 w-full space-y-2">
                                   <label className="text-[10px] font-black text-gray-400 uppercase">المنتج</label>
                                   <select 
                                     value={rule.productId}
                                     onChange={(e) => {
                                       const advancedRules = [...(settings.discounts?.advancedRules || [])];
                                       advancedRules[idx].productId = e.target.value;
                                       setSettings({ ...settings, discounts: { ...settings.discounts, advancedRules } });
                                     }}
                                     className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-bold text-gray-900"
                                   >
                                     {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                     ))}
                                   </select>
                                </div>
                                <div className="w-full md:w-1/4 space-y-2">
                                   <label className="text-[10px] font-black text-gray-400 uppercase">نوع الخصم</label>
                                   <select 
                                     value={rule.discountType}
                                     onChange={(e) => {
                                       const advancedRules = [...(settings.discounts?.advancedRules || [])];
                                       advancedRules[idx].discountType = e.target.value;
                                       setSettings({ ...settings, discounts: { ...settings.discounts, advancedRules } });
                                     }}
                                     className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-bold text-gray-900"
                                   >
                                      <option value="percentage">نسبة مئوية (%)</option>
                                      <option value="fixed">مبلغ ثابت (د.ج)</option>
                                   </select>
                                </div>
                                <div className="w-full md:w-1/4 space-y-2">
                                   <label className="text-[10px] font-black text-gray-400 uppercase">القيمة</label>
                                   <input 
                                     type="number" 
                                     min="0"
                                     value={rule.discountValue}
                                     onChange={(e) => {
                                       const advancedRules = [...(settings.discounts?.advancedRules || [])];
                                       advancedRules[idx].discountValue = parseInt(e.target.value) || 0;
                                       setSettings({ ...settings, discounts: { ...settings.discounts, advancedRules } });
                                     }}
                                     className="w-full bg-white border border-gray-200 rounded-xl py-2 px-3 text-xs font-bold text-gray-900"
                                   />
                                </div>
                                <button 
                                   onClick={() => {
                                     const advancedRules = settings.discounts.advancedRules.filter((_: any, i: number) => i !== idx);
                                     setSettings({ ...settings, discounts: { ...settings.discounts, advancedRules } });
                                   }}
                                   className="text-red-400 hover:text-red-600 mt-6"
                                >
                                   <Trash2 size={18} />
                                </button>
                             </div>
                          ))}
                          {(settings.discounts?.advancedRules || []).length === 0 && (
                             <p className="text-xs text-gray-400 font-bold italic text-center">لم يتم إضافة منتجات مخصصة. سيتم تطبيق الخصم العام.</p>
                          )}
                       </div>
                       
                       <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                          <p className="text-xs text-primary font-bold leading-relaxed">
                            💡 ملاحظة: هذا الخصم سيظهر تلقائياً للزبون الذي ليس لديه أي طلبات سابقة في المتجر بمجرد وصوله للعدد المحدد من المنتجات في السلة.
                          </p>
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === "marketing" && (
                 <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-blue-700 text-sm font-bold">
                      ⚡ أدخل معرّفات البيكسلات هنا. سيتم تحميلها تلقائياً على جميع صفحات المتجر وإرسال أحداث ViewContent وSubmitOrder.
                    </div>
                    <div className="space-y-3">
                       <label className="text-sm font-black text-gray-700 block mr-2">Facebook Pixel ID</label>
                       <div className="relative">
                         <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
                         <input 
                           type="text"
                           dir="ltr"
                           placeholder="مثال: 1234567890123456"
                           value={settings.marketing?.fbPixelId || ""}
                           onChange={(e) => setSettings({ ...settings, marketing: { ...settings.marketing, fbPixelId: e.target.value } })}
                           className="w-full bg-gray-50 border-none rounded-xl py-4 pr-12 pl-4 font-mono font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                         />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-sm font-black text-gray-700 block mr-2">TikTok Pixel ID</label>
                       <div className="relative">
                         <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-900" size={18} />
                         <input 
                           type="text"
                           dir="ltr"
                           placeholder="مثال: C4ABCDE12345678"
                           value={settings.marketing?.tiktokPixelId || ""}
                           onChange={(e) => setSettings({ ...settings, marketing: { ...settings.marketing, tiktokPixelId: e.target.value } })}
                           className="w-full bg-gray-50 border-none rounded-xl py-4 pr-12 pl-4 font-mono font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                         />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-sm font-black text-gray-700 block mr-2">Google Analytics Measurement ID</label>
                       <div className="relative">
                         <BarChart2 className="absolute right-4 top-1/2 -translate-y-1/2 text-orange-500" size={18} />
                         <input 
                           type="text"
                           dir="ltr"
                           placeholder="مثال: G-XXXXXXXXXX"
                           value={settings.marketing?.googleAnalyticsId || ""}
                           onChange={(e) => setSettings({ ...settings, marketing: { ...settings.marketing, googleAnalyticsId: e.target.value } })}
                           className="w-full bg-gray-50 border-none rounded-xl py-4 pr-12 pl-4 font-mono font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                         />
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === "policies" && (
                 <PoliciesEditor settings={settings} setSettings={setSettings} />
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
