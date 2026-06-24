import React, { useState } from 'react';
import { defaultPolicies } from '@/utils/defaultPolicies';
import { Plus, Trash2 } from 'lucide-react';

export default function PoliciesEditor({ settings, setSettings }: { settings: any; setSettings: (val: any) => void }) {
  const [activeTab, setActiveTab] = useState<"about" | "terms" | "privacy" | "shipping" | "refund">("about");
  const policiesData = settings.policies && Object.keys(settings.policies).length > 0 ? settings.policies : defaultPolicies;

  const updatePolicy = (key: string, data: any) => {
    setSettings({
      ...settings,
      policies: {
        ...policiesData,
        [key]: data,
      }
    });
  };

  const tabs = [
    { id: "about", name: "من نحن" },
    { id: "terms", name: "شروط الاستخدام" },
    { id: "privacy", name: "سياسة الخصوصية" },
    { id: "shipping", name: "سياسة الشحن" },
    { id: "refund", name: "سياسة الاسترجاع" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-right">
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl text-primary text-sm font-bold flex flex-col gap-2">
        <p>📝 تحكم في محتوى الصفحات القانونية وصفحة من نحن مع الحفاظ على التصميم.</p>
        <p>التعديلات هنا ستظهر بنفس الشكل والنظام الموجود حالياً في الموقع. يمكنك إضافة فقرات أو حذفها كما تشاء.</p>
      </div>

      <div className="flex gap-2 bg-gray-50 p-2 rounded-2xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab.id ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
        {activeTab === "about" && (
          <AboutEditor data={policiesData.about || defaultPolicies.about} onChange={(data: any) => updatePolicy("about", data)} />
        )}
        {activeTab === "terms" && (
          <PolicyEditor data={policiesData.terms || defaultPolicies.terms} onChange={(data: any) => updatePolicy("terms", data)} />
        )}
        {activeTab === "privacy" && (
          <PolicyEditor data={policiesData.privacy || defaultPolicies.privacy} onChange={(data: any) => updatePolicy("privacy", data)} />
        )}
        {activeTab === "shipping" && (
          <PolicyEditor data={policiesData.shipping || defaultPolicies.shipping} onChange={(data: any) => updatePolicy("shipping", data)} />
        )}
        {activeTab === "refund" && (
          <PolicyEditor data={policiesData.refund || defaultPolicies.refund} onChange={(data: any) => updatePolicy("refund", data)} />
        )}
      </div>
    </div>
  );
}

function AboutEditor({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <h3 className="font-black text-gray-800 text-lg border-b border-gray-100 pb-2">قسم الواجهة (Hero)</h3>
        <div className="space-y-3">
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest">العنوان الرئيسي</label>
          <textarea
            value={data.heroTitle}
            onChange={(e) => onChange({ ...data, heroTitle: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            rows={2}
          />
        </div>
        <div className="space-y-3">
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest">الوصف</label>
          <textarea
            value={data.heroDesc}
            onChange={(e) => onChange({ ...data, heroDesc: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-medium text-gray-600 focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Mission */}
      <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <h3 className="font-black text-gray-800 text-lg border-b border-gray-100 pb-2">قسم المهمة</h3>
        <div className="space-y-3">
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest">العنوان</label>
          <input
            type="text"
            value={data.missionTitle}
            onChange={(e) => onChange({ ...data, missionTitle: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-bold text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <div className="space-y-3">
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest">الفقرة الأولى</label>
          <textarea
            value={data.missionDesc1}
            onChange={(e) => onChange({ ...data, missionDesc1: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-medium text-gray-600 outline-none resize-none"
            rows={3}
          />
        </div>
        <div className="space-y-3">
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest">الفقرة الثانية</label>
          <textarea
            value={data.missionDesc2}
            onChange={(e) => onChange({ ...data, missionDesc2: e.target.value })}
            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-medium text-gray-600 outline-none resize-none"
            rows={3}
          />
        </div>
        <div className="space-y-3">
          <label className="text-xs font-black text-gray-500 uppercase tracking-widest">نقاط القوة (سطر لكل نقطة)</label>
          <textarea
            value={(data.missionBullets || []).join('\n')}
            onChange={(e) => onChange({ ...data, missionBullets: e.target.value.split('\n').filter(x => x.trim()) })}
            className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-medium text-gray-600 outline-none resize-y"
            rows={4}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <h3 className="font-black text-gray-800 text-lg border-b border-gray-100 pb-2">الإحصائيات والأرقام</h3>
        <div className="grid grid-cols-2 gap-4">
          {(data.stats || []).map((s: any, idx: number) => (
             <div key={idx} className="bg-gray-50 p-4 rounded-xl space-y-2">
               <input 
                 type="text" 
                 value={s.num} 
                 onChange={(e) => {
                   const stats = [...data.stats];
                   stats[idx].num = e.target.value;
                   onChange({ ...data, stats });
                 }}
                 className="w-full bg-white border-none rounded-lg py-2 px-3 text-center font-black text-primary" 
                 placeholder="0"
               />
               <input 
                 type="text" 
                 value={s.label} 
                 onChange={(e) => {
                   const stats = [...data.stats];
                   stats[idx].label = e.target.value;
                   onChange({ ...data, stats });
                 }}
                 className="w-full bg-white border-none rounded-lg py-2 px-3 text-center text-sm font-bold text-gray-600" 
                 placeholder="وصف الرقم"
               />
             </div>
          ))}
        </div>
      </div>

      {/* Values */}
      <div className="space-y-4 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <h3 className="font-black text-gray-800 text-lg border-b border-gray-100 pb-2">قيمنا</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data.values || []).map((v: any, idx: number) => (
             <div key={idx} className="bg-gray-50 p-4 rounded-xl space-y-3">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400">العنوان</label>
                 <input 
                   type="text" 
                   value={v.title} 
                   onChange={(e) => {
                     const values = [...data.values];
                     values[idx].title = e.target.value;
                     onChange({ ...data, values });
                   }}
                   className="w-full bg-white border-none rounded-lg py-2 px-3 font-bold text-gray-900" 
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-gray-400">الوصف</label>
                 <textarea 
                   rows={2}
                   value={v.desc} 
                   onChange={(e) => {
                     const values = [...data.values];
                     values[idx].desc = e.target.value;
                     onChange({ ...data, values });
                   }}
                   className="w-full bg-white border-none rounded-lg py-2 px-3 text-sm font-medium text-gray-600 resize-none" 
                 />
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PolicyEditor({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-black text-gray-700 block mr-2">العنوان الرئيسي</label>
        <input
          type="text"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 font-black text-xl text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>
      <div className="space-y-3">
        <label className="text-sm font-black text-gray-700 block mr-2">العنوان الفرعي</label>
        <input
          type="text"
          value={data.subtitle}
          onChange={(e) => onChange({ ...data, subtitle: e.target.value })}
          className="w-full bg-white border border-gray-100 rounded-xl py-3 px-4 font-medium text-gray-500 focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>

      <div className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-gray-800 text-lg">الأقسام والبنود</h3>
          <button 
             onClick={() => onChange({ ...data, sections: [...(data.sections || []), { title: "عنوان القسم الجديد", content: "اكتب المحتوى هنا..." }] })}
             className="text-primary text-xs font-bold flex items-center gap-1 hover:underline"
          >
             <Plus size={14} /> إضافة قسم جديد
          </button>
        </div>

        <div className="space-y-6">
          {(data.sections || []).map((section: any, idx: number) => (
             <div key={idx} className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm space-y-4 relative">
               <button 
                 onClick={() => {
                   const sections = data.sections.filter((_:any, i:number) => i !== idx);
                   onChange({ ...data, sections });
                 }}
                 className="absolute top-4 left-4 text-red-300 hover:text-red-500 transition-colors"
               >
                 <Trash2 size={18} />
               </button>
               <div className="space-y-2 pr-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الرقم وعنوان القسم</label>
                 <div className="flex gap-3 items-center">
                    <span className="w-8 h-8 shrink-0 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm font-black">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <input 
                      type="text"
                      value={section.title}
                      onChange={(e) => {
                        const sections = [...data.sections];
                        sections[idx].title = e.target.value;
                        onChange({ ...data, sections });
                      }}
                      className="flex-1 bg-gray-50 border-none rounded-xl py-2 px-3 font-bold text-gray-900"
                    />
                 </div>
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تلميح: استخدم سطر جديد لإنشاء نقاط (نقاط تعداد)</label>
                 <textarea 
                   rows={4}
                   value={section.content}
                   onChange={(e) => {
                     const sections = [...data.sections];
                     sections[idx].content = e.target.value;
                     onChange({ ...data, sections });
                   }}
                   className="w-full bg-gray-50 border-none rounded-xl py-3 px-4 font-medium text-gray-600 resize-y leading-loose"
                 />
               </div>
               
               {/* Optional Warning */}
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-red-400 uppercase tracking-widest">ملاحظة تحذيرية أسفل القسم (اختياري)</label>
                 <input 
                   type="text"
                   value={section.warning || ""}
                   placeholder="اتركه فارغاً إذا لم تكن تريد إضافة ملاحظة حمراء..."
                   onChange={(e) => {
                     const sections = [...data.sections];
                     sections[idx].warning = e.target.value;
                     onChange({ ...data, sections });
                   }}
                   className="w-full bg-red-50 text-red-700 placeholder-red-300 border border-red-100 rounded-xl py-2 px-3 text-sm font-bold"
                 />
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
