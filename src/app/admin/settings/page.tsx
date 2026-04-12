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
  Crown
} from "lucide-react";
import Link from "next/link";
import ImageUploader from "@/components/ImageUploader";



export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"branding" | "offers" | "marketing" | "email" | "navigation">("branding");
  const [settings, setSettings] = useState<Record<string, any>>({});
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
    setSettings(settingsMap);
    
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
           <p className="text-gray-500 font-medium">تحكم في هوية المتجر وأسعار التوصيل والإشعارات</p>
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
          <div className="space-y-2">
            {[
               { id: "branding", name: "الهوية والتواصل", icon: Palette },
               { id: "navigation", name: "قائمة الخدمات", icon: Globe },
               { id: "offers", name: "العروض والخصومات", icon: Tag },
               { id: "marketing", name: "بيكسلات التتبع", icon: BarChart2 },
               { id: "email", name: "رسائل البريد", icon: Mail },
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
               {activeTab === "branding" && (
                 <div className="space-y-8 animate-in fade-in duration-500">
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="space-y-3">
                           <label className="text-sm font-black text-gray-700 block mr-2">اسم المتجر</label>
                           <input 
                             type="text" 
                             value={settings.branding?.storeName || "Service Serigraphie"}
                             onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, storeName: e.target.value } })}
                             className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-bold text-gray-900"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-sm font-black text-gray-700 block mr-2">لون أساسي (Primary)</label>
                           <div className="flex gap-4 items-center">
                              <input 
                                type="color" 
                                value={settings.branding?.primaryColor || "#00AEEF"}
                                onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, primaryColor: e.target.value } })}
                                className="w-12 h-12 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                              />
                              <input 
                                type="text" 
                                value={settings.branding?.primaryColor || "#00AEEF"}
                                dir="ltr"
                                className="flex-1 bg-gray-50 border-none rounded-xl py-3 px-4 font-bold text-gray-600"
                                readOnly
                              />
                           </div>
                        </div>
                        <div className="space-y-3">
                           <label className="text-sm font-black text-gray-700 block mr-2">لون ثانوي (Secondary)</label>
                           <div className="flex gap-4 items-center">
                              <input 
                                type="color" 
                                value={settings.branding?.secondaryColor || "#e6007e"}
                                onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, secondaryColor: e.target.value } })}
                                className="w-12 h-12 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                              />
                              <input 
                                type="text" 
                                value={settings.branding?.secondaryColor || "#e6007e"}
                                dir="ltr"
                                className="flex-1 bg-gray-50 border-none rounded-xl py-3 px-4 font-bold text-gray-600"
                                readOnly
                              />
                           </div>
                        </div>
                     </div>

                     <div className="space-y-3">
                        <label className="text-sm font-black text-gray-700 flex items-center justify-between mr-2">
                           رفع شعار المتجر (Logo)
                           <span className="text-[10px] text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded-md">يُفضّل عرضي (Horizontal)</span>
                        </label>
                        <div className="bg-gray-50 p-4 rounded-3xl border border-gray-100">
                           <ImageUploader 
                              value={settings.branding?.logo || ""} 
                              onChange={(url) => setSettings({ ...settings, branding: { ...settings.branding, logo: url } })}
                              label=""
                              placeholder="اسحب أو ارفع اللوجو هنا..."
                           />
                        </div>
                     </div>


                    <div className="space-y-3">
                       <label className="text-sm font-black text-gray-700 block mr-2">رقم الواتساب للاستفسارات واستقبال الطلبات</label>
                       <div className="relative">
                          <MessageSquare className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                          <input 
                            type="text" 
                            dir="ltr"
                            value={settings.branding?.whatsappNumber || "213"}
                            onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, whatsappNumber: e.target.value } })}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 pr-12 pl-4 font-black"
                          />
                       </div>
                       <p className="text-[10px] text-gray-400 font-bold mr-2 uppercase tracking-tighter">أدخل الرقم بالصيغة الدولية (مثال: 2135XXXXXXXX)</p>
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
                                   const nav = [...settings.navigation];
                                   nav[idx].label = e.target.value;
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

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                             <label className="text-sm font-black text-gray-700 block mr-2">تفعيل الخصم</label>
                             <select
                               value={settings.discounts?.newCustomerDiscountEnabled === false ? "false" : "true"}
                               onChange={(e) => setSettings({ ...settings, discounts: { ...settings.discounts, newCustomerDiscountEnabled: e.target.value === "true" } })}
                               className="w-full bg-gray-50 border-none rounded-xl py-4 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                             >
                               <option value="true">مفعل (للزبائن الجدد فقط)</option>
                               <option value="false">معطل</option>
                             </select>
                          </div>
                          <div className="space-y-3">
                             <label className="text-sm font-black text-gray-700 block mr-2">نسبة الخصم المئوية (%)</label>
                             <input 
                               type="number" 
                               min="0"
                               max="100"
                               value={settings.discounts?.newCustomerDiscountPercent || 10}
                               onChange={(e) => setSettings({ ...settings, discounts: { ...settings.discounts, newCustomerDiscountPercent: parseInt(e.target.value) || 0 } })}
                               className="w-full bg-gray-50 border-none rounded-xl py-4 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                             />
                          </div>
                          <div className="space-y-3">
                             <label className="text-sm font-black text-gray-700 block mr-2">الحد الأدنى لعدد المنتجات</label>
                             <input 
                               type="number" 
                               min="1"
                               value={settings.discounts?.newCustomerMinItems || 2}
                               onChange={(e) => setSettings({ ...settings, discounts: { ...settings.discounts, newCustomerMinItems: parseInt(e.target.value) || 1 } })}
                               className="w-full bg-gray-50 border-none rounded-xl py-4 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 transition-all"
                             />
                          </div>
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

               {activeTab === "email" && (
                 <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="space-y-3">
                       <label className="text-sm font-black text-gray-700 block mr-2">قالب رسالة تأكيد الطلب</label>
                       <textarea 
                         value={settings.email?.emailTemplate || ""}
                         onChange={(e) => setSettings({ ...settings, email: { ...settings.email, emailTemplate: e.target.value } })}
                         className="w-full bg-gray-50 border-none rounded-xl py-4 px-4 font-medium h-64 resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                       />
                       <p className="text-[10px] text-gray-400 font-bold mr-2 uppercase tracking-tighter">استخدم المتغيرات التالية: {"{name}"}, {"{order_number}"}, {"{link}"}</p>
                    </div>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
