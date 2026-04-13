import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white font-arabic" dir="rtl">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">سياسة الخصوصية</h1>
          <p className="text-gray-500 font-medium text-lg">كيف نحمي بياناتك ونحترم خصوصيتك في متجر Service Serigraphie</p>
          <div className="w-20 h-2 bg-primary mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-10 leading-relaxed text-right">
          <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">01</span>
              جمع المعلومات
            </h2>
            <p>
              نحن نقوم بجمع المعلومات التي تقدمها لنا مباشرة عند تقديم طلب عبر متجرنا، وتشمل: الاسم، رقم الهاتف، والعنوان. هذه البيانات ضرورية فقط لمعالجة طلبك والتواصل معك عبر واتساب لتأكيد الشحن.
            </p>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">02</span>
              استخدام البيانات
            </h2>
            <p>
              نستخدم معلوماتك في:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>معالجة وتأكيد طلبات الشراء الخاصة بك.</li>
              <li>التواصل السريع عبر واتساب للتنسيق حول موعد التسليم.</li>
              <li>تحسين خدماتنا وتجربة التسوق الخاصة بك.</li>
            </ul>
          </section>

          <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">03</span>
              حماية البيانات
            </h2>
            <p>
              نحن نلتزم بحماية بياناتك الشخصية من الوصول غير المصرح به. لا نقوم ببيع أو تأجير أو مشاركة بياناتك مع أي طرف ثالث لأغراض تسويقية. يتم تخزين بياناتك في بيئة مشفرة وآمنة تماماً.
            </p>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">04</span>
              حقوقك
            </h2>
            <p>
              لك الحق في أي وقت في طلب تعديل بياناتك أو حذفها نهائياً من سجلاتنا من خلال التواصل معنا عبر الواتساب الرسمي المسجل في الموقع.
            </p>
          </section>

          <div className="pt-10 border-t border-gray-100 text-center">
            <p className="text-gray-400 font-bold text-sm">آخر تحديث: أبريل 2026</p>
            <p className="text-primary font-black mt-2">متجر Service Serigraphie الجزائري</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
