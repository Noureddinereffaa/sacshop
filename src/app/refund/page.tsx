import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: "سياسة الاسترجاع والاستبدال | Service Serigraphie",
  description: "معلومات الاسترجاع والاستبدال للمنتجات المخصصة في متجر Service Serigraphie",
};

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-white font-arabic" dir="rtl">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">سياسة الاسترجاع والاستبدال</h1>
          <p className="text-gray-500 font-medium text-lg">نحن نضمن جودة مطبوعاتنا ونلتزم بحقوق عملائنا وفق طبيعة العمل</p>
          <div className="w-20 h-2 bg-primary mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-10 leading-relaxed text-right">
          <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">01</span>
              طبيعة المنتجات المخصصة
            </h2>
            <p>
              نحيطكم علماً بأن أغلب خدماتنا هي **خدمات طباعة مخصصة (Custom Printing)** تحمل شعاركم الخاص. وبناءً عليه، لا يمكن إرجاع المنتج أو استبداله بمجرد البدء في عملية الطباعة إلا في حالات محددة تتعلق بجودة العمل أو الخطأ المصنعي.
            </p>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">02</span>
              حالات الاستبدال والاسترجاع
            </h2>
            <p>
              يحق للعميل طلب الاستبدال أو الاسترجاع في الحالات التالية فقط:
            </p>
            <ul className="list-disc list-inside space-y-2 mr-4 mt-4">
              <li>وجود خطأ في الطباعة يختلف عما تم تأكيده في "النموذج النهائي" عبر الواتساب.</li>
              <li>وجود تلف واضح في المنتجات عند الاستلام.</li>
              <li>وصول كميات ناقصة عما تم الاتفاق عليه ودفع ثمنه.</li>
            </ul>
          </section>

          <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">03</span>
              إجراءات الطلب
            </h2>
            <p>
              يجب التبليغ عن أي مشكلة في الطلب خلال **24 ساعة** من استلامه. يرجى تصوير المشكلة بوضوح وإرسال الصور عبر واتساب لخدمة العملاء. سنقوم بمراجعة الطلب وتعويضك إما بإعادة الطباعة أو استرداد المبلغ المتفق عليه.
            </p>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">04</span>
              الغاء الطلب
            </h2>
            <p>
              يمكنك إلغاء الطلب في أي وقت **قبل** الانتقال لمرحلة الطباعة الفنية. بمجرد اعتماد "النموذج النهائي" والبدء في التنفيذ، لا يمكن إلغاء الطلب نظراً لاستهلاك المواد الخام المخصصة لشعاركم.
            </p>
          </section>

          <div className="pt-10 border-t border-gray-100 text-center">
            <p className="text-gray-400 font-bold text-sm">ثقتكم هي رأسمالنا ونحن هنا لضمان رضاكم التام</p>
            <p className="text-primary font-black mt-2">فريق Service Serigraphie</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
