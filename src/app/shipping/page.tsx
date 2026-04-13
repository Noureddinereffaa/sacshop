import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: "سياسة الشحن والتوصيل | Service Serigraphie",
  description: "معلومات الشحن والتوصيل لجميع الولايات الجزائرية من متجر Service Serigraphie",
};

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white font-arabic" dir="rtl">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">سياسة الشحن والتوصيل</h1>
          <p className="text-gray-500 font-medium text-lg">نحن نوصل طلباتكم إلى 58 ولاية جزائرية بكل أمان وسرعة</p>
          <div className="w-20 h-2 bg-primary mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-10 leading-relaxed text-right">
          <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">01</span>
              مدة التوصيل
            </h2>
            <p>
              تتراوح مدة التوصيل عادة بين **24 إلى 72 ساعة** عمل من تاريخ تأكيد الطلب عبر الواتساب. قد تختلف المدة قليلاً حسب الولايات البعيدة أو ظروف الشحن الاستثنائية.
            </p>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">02</span>
              تغطية الشحن
            </h2>
            <p>
              نوفر خدمة التوصيل لـ **58 ولاية جزائرية**. يمكنك استلام طلبيتك إما في مكتب شركة الشحن في ولايتك (Stop Desk) أو مباشرة إلى باب منزلك أو مقر عملك (Home Delivery).
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">03</span>
              تأكيد الطلب
            </h2>
            <p>
              لا يتم شحن أي طلب إلا بعد تواصل فريق خدمة العملاء معك عبر **واتساب** لتأكيد العنوان النهائي وتفاصيل المنتجات المخصصة. يرجى التأكد من بقاء هاتفك متاحاً.
            </p>
          </section>

          <section className="p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
              <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">04</span>
              تكاليف الشحن
            </h2>
            <p>
              يتم احتساب تكلفة الشحن آلياً بناءً على الولاية المختارة. ستظهر لك التكلفة النهائية عند التحدث مع ممثلنا على الواتساب قبل إتمام عملية الشحن.
            </p>
          </section>

          <div className="pt-10 border-t border-gray-100 text-center">
            <p className="text-gray-400 font-bold text-sm">نحن شركاؤكم في النجاح ونحرص على وصول منتجاتكم بأفضل حال</p>
            <p className="text-primary font-black mt-2">Service Serigraphie - الجودة في كل تفصيل</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
