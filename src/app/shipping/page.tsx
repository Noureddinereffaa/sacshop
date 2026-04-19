import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/lib/supabase';
import { defaultPolicies } from '@/utils/defaultPolicies';

export const metadata = {
  title: "سياسة الشحن والتوصيل | Service Serigraphie",
  description: "معلومات الشحن والتوصيل لجميع الولايات الجزائرية من متجر Service Serigraphie",
};

export const revalidate = 60;

export default async function ShippingPolicy() {
  let customContent = defaultPolicies.shipping;
  if (supabase) {
    const { data } = await supabase.from("settings").select("value").eq("key", "policies").maybeSingle();
    if (data?.value?.shipping && typeof data.value.shipping === 'object' && Array.isArray(data.value.shipping.sections)) {
      customContent = data.value.shipping;
    }
  }

  return (
    <div className="min-h-screen bg-white font-arabic" dir="rtl">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">{customContent.title || "سياسة الشحن والتوصيل"}</h1>
          <p className="text-gray-500 font-medium text-lg">{customContent.subtitle}</p>
          <div className="w-20 h-2 bg-primary mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="prose prose-lg max-w-none text-gray-700 space-y-10 leading-relaxed text-right">
           {(customContent.sections || []).map((section: any, idx: number) => (
              <section key={idx} className={idx % 2 === 0 ? "bg-gray-50 p-8 rounded-[2rem] border border-gray-100" : "p-8"}>
                <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                  <span className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-sm">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  {section.title}
                </h2>
                <div className="whitespace-pre-wrap leading-loose">
                  {section.content}
                </div>
                {section.warning && (
                  <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-bold">
                     {section.warning}
                  </div>
                )}
              </section>
           ))}

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
