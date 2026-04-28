"use client";

import { motion } from "framer-motion";
import { 
  ShieldCheck, Target, Zap, 
  BarChart3, MousePointer2, 
  Settings, CheckCircle2, FileText,
  Download, Facebook, Share2,
  ShoppingBag, Users, LayoutDashboard,
  ShieldAlert, Smartphone, Globe,
  Layers, Gift, Key, Palette, Printer,
  Eye, Info, List, PlusCircle, PenTool,
  Map, Phone, Hash, CreditCard
} from "lucide-react";
import { useRef } from "react";

export default function StoreManualPage() {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20" dir="rtl">
      {/* Header Actions */}
      <div className="max-w-6xl mx-auto pt-8 px-6 flex justify-between items-center mb-8 no-print">
        <div>
          <h1 className="text-3xl font-black text-gray-900">الموسوعة التشغيلية الشاملة</h1>
          <p className="text-gray-500 font-bold text-sm">الدليل الكامل لكل ركن في نظام SacShop</p>
        </div>
        <button 
          onClick={handlePrint}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <Download size={22} />
          تصدير الموسوعة (PDF)
        </button>
      </div>

      {/* The Manual Document */}
      <div 
        ref={reportRef}
        className="max-w-6xl mx-auto bg-white shadow-2xl shadow-gray-200/50 rounded-[3rem] overflow-hidden border border-gray-100 print:shadow-none print:border-none print:rounded-none"
      >
        {/* Cover Section */}
        <div className="bg-gray-900 p-16 md:p-24 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[700px] h-[700px] bg-primary/20 rounded-full blur-[150px] -mr-96 -mt-96"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center font-black text-5xl mb-10 shadow-2xl shadow-primary/40">S</div>
            <h1 className="text-5xl md:text-8xl font-black leading-tight mb-8">الموسوعة <br/><span className="text-primary">التشغيلية والتقنية</span></h1>
            <p className="text-xl text-gray-400 font-bold max-w-3xl mb-12 leading-relaxed">
              الدليل الرسمي والوحيد الذي يشرح كل زر، كل صفحة، وكل تقنية مدمجة داخل نظام SacShop. دليلك للانتقال بالتجارة الإلكترونية إلى مستوى الاحتراف.
            </p>
            <div className="flex flex-wrap gap-8 items-center border-t border-white/10 pt-10">
              <div className="flex items-center gap-3 text-gray-400 font-bold bg-white/5 px-4 py-2 rounded-xl">
                <Globe size={18} className="text-primary" />
                <span>نظام التجارة المتكامل v2.5</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 font-bold bg-white/5 px-4 py-2 rounded-xl">
                <FileText size={18} className="text-primary" />
                <span>80+ ميزة برمجية مدمجة</span>
              </div>
            </div>
          </div>
        </div>

        {/* Table of Contents (Visual) */}
        <div className="p-10 md:p-16 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 border-b border-gray-100">
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Smartphone size={20}/></div>
             <h4 className="font-black text-gray-900 mb-2">1. دليل المتجر</h4>
             <p className="text-xs text-gray-500 font-bold">كل ما يخص تجربة الزبون من الدخول للطلب.</p>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4"><LayoutDashboard size={20}/></div>
             <h4 className="font-black text-gray-900 mb-2">2. دليل لوحة التحكم</h4>
             <p className="text-xs text-gray-500 font-bold">إدارة الطلبات، المنتجات، والتحليلات المالية.</p>
           </div>
           <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
             <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4"><Zap size={20}/></div>
             <h4 className="font-black text-gray-900 mb-2">3. الدليل التقني</h4>
             <p className="text-xs text-gray-500 font-bold">خفايا التتبع، الأمان، والتكامل مع فيسبوك.</p>
           </div>
        </div>

        {/* --- BOOK 1: FRONTEND --- */}
        <div className="p-10 md:p-20 space-y-20">
           <section className="space-y-12">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-3xl flex items-center justify-center shadow-lg"><Smartphone size={32}/></div>
                <h2 className="text-4xl font-black text-gray-900">الكتاب الأول: تجربة الزبون (Frontend)</h2>
             </div>

             {/* Product Page Deep Dive */}
             <div className="space-y-8">
               <div className="flex items-center gap-3 border-r-4 border-blue-600 pr-4">
                 <Eye size={24} className="text-blue-600" />
                 <h3 className="text-2xl font-black text-gray-900">تشريح صفحة المنتج (Product Page)</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="mt-1 font-black text-blue-600">01</div>
                      <div>
                        <p className="font-black text-gray-900">محرك التسعير الحي (Live Price Calculator)</p>
                        <p className="text-sm text-gray-500 font-bold leading-relaxed">بمجرد تغيير الزبون لعدد الألوان أو الكمية، يقوم المتجر بإعادة حساب السعر الإجمالي فوراً بدون تحميل الصفحة، مما يسرع قرار الشراء.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="mt-1 font-black text-blue-600">02</div>
                      <div>
                        <p className="font-black text-gray-900">خيارات التخصيص (Advanced Variants)</p>
                        <p className="text-sm text-gray-500 font-bold leading-relaxed">دعم كامل للمقاسات، الألوان، وعدد ألوان الطباعة. كل خيار يمكن أن يكون له "سعر إضافي" خاص به.</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="mt-1 font-black text-blue-600">03</div>
                      <div>
                        <p className="font-black text-gray-900">استمارة الطلب (Express Checkout)</p>
                        <p className="text-sm text-gray-500 font-bold leading-relaxed">استمارة من صفحة واحدة تطلب فقط المعلومات الحيوية لتقليل نسبة التخلي عن السلة.</p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="mt-1 font-black text-blue-600">04</div>
                      <div>
                        <p className="font-black text-gray-900">حساب الزبون التلقائي</p>
                        <p className="text-sm text-gray-500 font-bold leading-relaxed">النظام يحفظ بيانات الزبون تلقائياً بعد أول طلب ليسهل عليه الطلبات القادمة (Loyalty System).</p>
                      </div>
                    </div>
                  </div>
               </div>
             </div>
           </section>

           {/* --- BOOK 2: ADMIN DASHBOARD --- */}
           <section className="space-y-12">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-lg"><LayoutDashboard size={32}/></div>
                <h2 className="text-4xl font-black text-gray-900">الكتاب الثاني: لوحة التحكم (Admin Panel)</h2>
             </div>

             {/* Order Management */}
             <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 space-y-10">
               <div className="flex items-center gap-3">
                 <List size={24} className="text-indigo-600" />
                 <h3 className="text-2xl font-black text-gray-900">إدارة الطلبيات (Order Hub)</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2"><Map size={18} className="text-indigo-600"/> التوزيع الجغرافي</h4>
                    <p className="text-sm text-gray-500 font-bold leading-relaxed">عرض تفصيلي لولاية الزبون وعنوانه لسهولة التنسيق مع شركات التوصيل الجزائرية.</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2"><Phone size={18} className="text-indigo-600"/> التواصل السريع</h4>
                    <p className="text-sm text-gray-500 font-bold leading-relaxed">أزرار اتصال مباشر عبر الهاتف أو الواتساب لكل طلبية، لتسهيل عملية التأكيد (Confirmation).</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2"><ShieldAlert size={18} className="text-red-600"/> مراقب الاحتيال</h4>
                    <p className="text-sm text-gray-500 font-bold leading-relaxed">النظام يلون الطلبات المشبوهة أو المتكررة باللون الأحمر لتنبيهك قبل صرف أي ميزانية توصيل.</p>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2"><Hash size={18} className="text-indigo-600"/> تتبع الإعلانات</h4>
                    <p className="text-sm text-gray-500 font-bold leading-relaxed">لكل طلب، يوجد قسم مخفي يخبرك بالضبط أي إعلان فيسبوك جلب هذا الزبون.</p>
                  </div>
               </div>
             </div>

             {/* Products Management */}
             <div className="space-y-8">
               <div className="flex items-center gap-3 border-r-4 border-indigo-600 pr-4">
                 <PlusCircle size={24} className="text-indigo-600" />
                 <h3 className="text-2xl font-black text-gray-900">إدارة المنتجات والتخصيص</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-white border border-gray-100 rounded-3xl text-center space-y-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto"><PenTool size={24}/></div>
                    <h4 className="font-black text-gray-900">تعديل المحتوى</h4>
                    <p className="text-xs text-gray-500 font-bold">تحكم كامل في الصور، العناوين، والوصف المقنع لكل منتج.</p>
                  </div>
                  <div className="p-6 bg-white border border-gray-100 rounded-3xl text-center space-y-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto"><CreditCard size={24}/></div>
                    <h4 className="font-black text-gray-900">إعداد الأسعار</h4>
                    <p className="text-xs text-gray-500 font-bold">تحديد أسعار التجزئة، الجملة، وتكاليف الطباعة الإضافية بدقة.</p>
                  </div>
                  <div className="p-6 bg-white border border-gray-100 rounded-3xl text-center space-y-4">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto"><Gift size={24}/></div>
                    <h4 className="font-black text-gray-900">العروض الخاصة</h4>
                    <p className="text-xs text-gray-500 font-bold">إمكانية إضافة شريط عد تنازلي أو تخفيضات "اشترِ 2 واحصل على خصم".</p>
                  </div>
               </div>
             </div>
           </section>

           {/* --- BOOK 3: TECHNICAL BRAIN --- */}
           <section className="space-y-12">
             <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary text-white rounded-3xl flex items-center justify-center shadow-lg"><Zap size={32}/></div>
                <h2 className="text-4xl font-black text-gray-900">الكتاب الثالث: الدليل التقني المتقدم</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                     <ShieldCheck className="text-primary" size={24} />
                     <h4 className="text-xl font-black text-gray-900">نظام البيكسل الهجين</h4>
                   </div>
                   <p className="text-gray-500 font-bold leading-relaxed">
                     شرح كيف يعمل المتجر على إرسال الأحداث لفيسبوك عبر المتصفح وعبر السيرفر (CAPI) لضمان عدم ضياع أي بيانات مبيعة حتى مع وجود AdBlock.
                   </p>
                </div>
                <div className="space-y-6">
                   <div className="flex items-center gap-3">
                     <BarChart3 className="text-primary" size={24} />
                     <h4 className="text-xl font-black text-gray-900">حسابات الربحية الصافية</h4>
                   </div>
                   <p className="text-gray-500 font-bold leading-relaxed">
                     كيف تحسب لوحة التحليلات الأرباح الصافية بعد خصم مصاريف فيسبوك (عبر الربط المباشر مع API الإعلانات) وتكاليف السلع.
                   </p>
                </div>
             </div>
           </section>

           {/* Final Page */}
           <div className="pt-20 text-center space-y-10 border-t border-gray-100">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner"><CheckCircle2 size={40}/></div>
              <div className="space-y-4">
                <h3 className="text-4xl font-black text-gray-900">مبروك! أنت تملك الآن أقوى نظام COD في الجزائر.</h3>
                <p className="text-gray-500 font-bold text-lg max-w-3xl mx-auto">
                  هذا الدليل يضمن لك تشغيلاً مثالياً لمتجرك. التزم بالخطوات، راقب تحليلاتك، وستصل بمتجرك إلى آفاق جديدة.
                </p>
              </div>
           </div>

           {/* Footer */}
           <footer className="pt-20 border-t border-gray-100 flex justify-between items-center text-gray-400">
             <p className="font-bold text-xs uppercase tracking-widest">SacShop Unified Operations Manual</p>
             <p className="font-bold text-xs">إعداد: فريق التطوير المتقدم © 2026</p>
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
          @page { margin: 1cm; }
        }
      `}</style>
    </div>
  );
}
