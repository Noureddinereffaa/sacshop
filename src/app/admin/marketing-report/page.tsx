"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheck, Target, Zap, 
  BarChart3, MousePointer2, 
  Settings, CheckCircle2, FileText,
  Download, Facebook, Share2
} from "lucide-react";
import { useRef } from "react";

export default function MarketingReportPage() {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      {/* Header Actions */}
      <div className="max-w-4xl mx-auto pt-8 px-6 flex justify-between items-center mb-8 no-print">
        <div>
          <h1 className="text-2xl font-black text-gray-900">تقرير الأنظمة التسويقية</h1>
          <p className="text-gray-500 font-bold text-sm">عرض وتحميل دليل نظام التتبع للعميل</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Download size={20} />
          تحميل بصيغة PDF
        </button>
      </div>

      {/* The Report Document */}
      <div 
        ref={reportRef}
        className="max-w-4xl mx-auto bg-white shadow-2xl shadow-gray-200/50 rounded-[2.5rem] overflow-hidden border border-gray-100 print:shadow-none print:border-none print:rounded-none"
      >
        {/* Cover Section */}
        <div className="bg-gray-950 p-12 md:p-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-48 -mt-48"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center font-black text-4xl mb-8">S</div>
            <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">دليل هندسة التتبع <br/><span className="text-primary">والذكاء الإعلاني</span></h1>
            <div className="flex flex-wrap gap-6 items-center">
              <div className="flex items-center gap-2 text-gray-400 font-bold">
                <FileText size={18} />
                <span>إصدار 2026.04</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 font-bold">
                <ShieldCheck size={18} className="text-green-500" />
                <span>نظام مشفر بالكامل</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-10 md:p-16 space-y-16">
          
          {/* Section 1: Hybrid Tracking */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Zap size={24} />
              </div>
              <h2 className="text-2xl font-black text-gray-900">1. تكنولوجيا التتبع الهجين (Pixel + CAPI)</h2>
            </div>
            <p className="text-gray-600 font-bold leading-relaxed text-lg">
              يعتمد النظام على دمج تتبع المتصفح التقليدي مع تتبع السيرفر المباشر (Server-Side). هذا يضمن وصول البيانات حتى لو كان الزبون يستخدم مانع إعلانات (AdBlocker) أو أجهزة iPhone الحديثة التي تحظر التتبع.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <Facebook className="text-blue-600" size={20} />
                  <span className="font-black text-gray-900">Meta Pixel</span>
                </div>
                <p className="text-sm text-gray-500 font-bold">تتبع لحظي داخل المتجر لتسجيل النقرات والتحركات السريعة.</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <Settings className="text-primary" size={20} />
                  <span className="font-black text-gray-900">Conversions API</span>
                </div>
                <p className="text-sm text-gray-500 font-bold">مزامنة آمنة من سيرفر المتجر لضمان دقة البيانات وحماية الخصوصية.</p>
              </div>
            </div>
          </section>

          {/* Section 2: Funnel Logic */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm">
                <Target size={24} />
              </div>
              <h2 className="text-2xl font-black text-gray-900">2. هندسة الأحداث (Marketing Funnel)</h2>
            </div>
            <p className="text-gray-600 font-bold leading-relaxed">
              تمت برمجة المتجر ليرسل إشارات ذكية لخوارزميات فيسبوك في كل خطوة يخطوها الزبون:
            </p>
            <div className="space-y-3">
               {[
                 { event: 'ViewContent', desc: 'عند استعراض الزبون لأي منتج.' },
                 { event: 'AddToCart', desc: 'عند إضافة المنتج لسلة التسوق.' },
                 { event: 'Lead', desc: 'عند تعبئة استمارة الطلب (بيانات أولية).' },
                 { event: 'Contact', desc: 'عند الضغط على زر الواتساب (تواصل جاد).' },
                 { event: 'Purchase', desc: 'المبيعة الحقيقية (ترسل فقط بعد تأكيدك للطلب).' },
               ].map((item, idx) => (
                 <div key={idx} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 hover:border-primary/30 transition-colors group">
                    <div className="w-8 h-8 bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white rounded-lg flex items-center justify-center font-black text-xs transition-all">{idx + 1}</div>
                    <div className="flex-1">
                      <span className="font-black text-gray-900 ml-2">{item.event}</span>
                      <span className="text-gray-500 font-bold text-sm border-r border-gray-200 pr-3 mr-1">{item.desc}</span>
                    </div>
                    <CheckCircle2 className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" size={18} />
                 </div>
               ))}
            </div>
          </section>

          {/* Section 3: Admin Control */}
          <section className="bg-primary/5 p-8 md:p-12 rounded-[2.5rem] border border-primary/10 space-y-6">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                  <BarChart3 size={24} />
                </div>
                <h2 className="text-2xl font-black text-gray-900">3. التحكم الكامل والتحليلات</h2>
             </div>
             <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1"><MousePointer2 className="text-primary" size={20} /></div>
                  <div>
                    <p className="font-black text-gray-900">التحكم في الأحداث (Status-Driven Events)</p>
                    <p className="text-sm text-gray-500 font-bold leading-relaxed">أنت المتحكم! حدث الـ Purchase لا يتم إرساله لفيسبوك إلا عندما تغير حالة الطلب إلى "مؤكد". هذا يحمي حسابك الإعلاني من البيانات الوهمية.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1"><Share2 className="text-primary" size={20} /></div>
                  <div>
                    <p className="font-black text-gray-900">تتبع مصادر الإعلانات (UTM Tracking)</p>
                    <p className="text-sm text-gray-500 font-bold leading-relaxed">النظام يخبرك باسم الحملة الإعلانية التي جاء منها كل زبون داخل تفاصيل الطلب، لتعرف أي إعلان هو المربح فعلياً.</p>
                  </div>
                </div>
             </div>
          </section>

          {/* Footer of report */}
          <footer className="pt-10 border-t border-gray-100 flex justify-between items-center text-gray-400">
             <p className="font-bold text-xs uppercase tracking-widest">SacShop Digital Ecosystem</p>
          </footer>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; }
          .print\:shadow-none { box-shadow: none !important; }
          .print\:border-none { border: none !important; }
          .print\:rounded-none { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  );
}
