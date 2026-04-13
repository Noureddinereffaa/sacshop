import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-white font-arabic" dir="rtl">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">شروط الاستخدام</h1>
          <p className="text-gray-500 font-medium text-lg">الاتفاقية القانونية المنظمة للتعامل بين المتجر والعميل</p>
          <div className="w-20 h-2 bg-primary mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-10 leading-relaxed text-right">
          <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">01</span>
              طبيعة الخدمة
            </h2>
            <p>
              متجر Service Serigraphie يقدم خدمات تجارة إلكترونية متخصصة في التغليف والطباعة والمنتجات التجارية في الجزائر. جميع الطلبات تتم مباشرة عبر الموقع ويتم تأكيدها والتنسيق حول تفاصيلها الفنية والشحن عبر تطبيق واتساب.
            </p>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">02</span>
              عملية الطلب والشحن
            </h2>
            <ul className="list-disc list-inside space-y-2 mr-4">
              <li>بمجرد ضغطك على "تأكيد الطلب"، يتم إرسال طلبك لفريقنا.</li>
              <li>سيقوم أحد ممثلي خدمة العملاء بالتواصل معك عبر واتساب لتأكيد الكميات، السعر النهائي، وتفاصيل الشحن.</li>
              <li>يعتبر الطلب ملزماً فقط بعد تأكيده عبر واتساب من قبل العميل.</li>
            </ul>
          </section>

          <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">03</span>
              الدفع عند الاستلام (COD)
            </h2>
            <p>
              نحن نعتمد نظام "الدفع عند الاستلام" كخيار أساسي. يلتزم العميل بدفع القيمة المتفق عليها للموزع عند استلام الطرد. 
            </p>
            <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-bold">
               ⚠️ ملاحظة: عدم استلام الطرد بعد تأكيده دون سبب منطقي يعرض العميل للإدراج في القائمة السوداء للمتجر.
            </div>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">04</span>
              سياسة الإرجاع والتبديل
            </h2>
            <p>
              نظراً لأن معظم منتجاتنا مخصصة (Custom Printing)، لا يمكن إرجاع المنتج بعد الطباعة إلا في حال وجود خطأ مصنعي أو اختلاف عما تم الاتفاق عليه في تأكيد الواتساب.
            </p>
          </section>

          <div className="pt-10 border-t border-gray-100 text-center">
            <p className="text-gray-400 font-bold text-sm">نحن نعمل وفق القوانين المنظمة للتجارة الإلكترونية في الجزائر</p>
            <p className="text-primary font-black mt-2">Service Serigraphie - شريكك الموثوق</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
