"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Palette, 
  Truck, 
  MessageSquare, 
  Save, 
  Loader2, 
  Globe, 
  Mail,
  CheckCircle2
} from "lucide-react";

interface Setting {
  key: string;
  value: any;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<"branding" | "delivery" | "email">("branding");
  const [settings, setSettings] = useState<any>({});
  const [wilayaFees, setWilayaFees] = useState<any[]>([]);
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

    // Fetch Delivery Fees joined with Wilayas
    const { data: feesData } = await supabase
      .from("delivery_fees")
      .select("*, wilayas(name_ar)");
    
    setWilayaFees(feesData || []);
    
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
              { id: "branding", name: "الهوية والبراندينغ", icon: Palette },
              { id: "delivery", name: "خدمات التوصيل", icon: Truck },
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-sm font-black text-gray-700 block mr-2">لون البراند الأساسي</label>
                          <div className="flex gap-4 items-center">
                             <input 
                               type="color" 
                               value={settings.branding?.primaryColor || "#4a7c7c"}
                               onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, primaryColor: e.target.value } })}
                               className="w-12 h-12 rounded-lg cursor-pointer border-none p-0 bg-transparent"
                             />
                             <input 
                               type="text" 
                               value={settings.branding?.primaryColor || "#4a7c7c"}
                               dir="ltr"
                               className="flex-1 bg-gray-50 border-none rounded-xl py-3 px-4 font-bold text-gray-600"
                               readOnly
                             />
                          </div>
                       </div>
                       <div className="space-y-3">
                          <label className="text-sm font-black text-gray-700 block mr-2">اسم المتجر</label>
                          <input 
                            type="text" 
                            value={settings.branding?.storeName || "SacShop"}
                            onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, storeName: e.target.value } })}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-bold text-gray-900"
                          />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-sm font-black text-gray-700 block mr-2">رابط اللوجو (Logo URL)</label>
                       <div className="relative">
                          <Globe className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                            type="text" 
                            placeholder="https://..."
                            value={settings.branding?.logo || ""}
                            onChange={(e) => setSettings({ ...settings, branding: { ...settings.branding, logo: e.target.value } })}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 pr-12 pl-4 font-medium"
                          />
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === "delivery" && (
                 <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="space-y-3">
                       <label className="text-sm font-black text-gray-700 block mr-2">رقم الواتساب للاستفسارات</label>
                       <div className="relative">
                          <MessageSquare className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500" size={18} />
                          <input 
                            type="text" 
                            dir="ltr"
                            value={settings.delivery?.whatsappNumber || "213"}
                            onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, whatsappNumber: e.target.value } })}
                            className="w-full bg-gray-50 border-none rounded-xl py-3 pr-12 pl-4 font-black"
                          />
                       </div>
                       <p className="text-[10px] text-gray-400 font-bold mr-2 uppercase tracking-tighter">أدخل الرقم بالصيغة الدولية (مثال: 2135XXXXXXXX)</p>
                    </div>

                    <div className="pt-8 border-t border-gray-100">
                       <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                          <Truck size={20} className="text-primary" />
                          إدارة أسعار الولايات (تحكم يدوي)
                       </h3>
                       <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {wilayaFees.length === 0 && <p className="text-center py-10 text-gray-400 italic">لا يوجد بيانات للولايات حالياً</p>}
                          {wilayaFees.map((fee, idx) => (
                            <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl group hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100">
                               <span className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center font-black text-xs">{fee.wilaya_id}</span>
                               <span className="flex-1 font-bold text-gray-950">{fee.wilayas?.name_ar}</span>
                               <div className="flex items-center gap-3">
                                  <div className="flex flex-col">
                                     <span className="text-[9px] font-black text-gray-400 uppercase mr-2">للمنزل</span>
                                     <input type="number" defaultValue={fee.home_fee} className="w-24 bg-white border border-gray-200 rounded-lg p-2 text-sm font-black text-primary text-center" />
                                  </div>
                                  <div className="flex flex-col">
                                     <span className="text-[9px] font-black text-gray-400 uppercase mr-2">للمكتب</span>
                                     <input type="number" defaultValue={fee.desk_fee} className="w-24 bg-white border border-gray-200 rounded-lg p-2 text-sm font-black text-primary text-center" />
                                  </div>
                               </div>
                            </div>
                          ))}
                       </div>
                    </div>
                 </div>
               )}

               {activeTab === "email" && (
                 <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="space-y-3">
                       <label className="text-sm font-black text-gray-700 block mr-2">قالب رسالة تأكيد الطلب</label>
                       <textarea 
                         value={settings.delivery?.emailTemplate || ""}
                         onChange={(e) => setSettings({ ...settings, delivery: { ...settings.delivery, emailTemplate: e.target.value } })}
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
