import Link from "next/link";
import { CheckCircle2, Truck, ShieldCheck, HeadphonesIcon, Award, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata = {
  title: "من نحن | Service Serigraphie",
  description: "تعرف على Service Serigraphie، الوجهة الأولى لخدمات الطباعة والسيريغرافي في الجزائر",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />
      {/* Hero */}
      <section className="bg-gradient-to-bl from-primary/5 via-white to-teal-50/30 py-24 text-right">
        <div className="container mx-auto px-4 max-w-4xl">
          <p className="text-primary font-bold text-sm uppercase tracking-widest mb-4">من نحن</p>
          <h1 className="text-5xl font-black text-gray-950 mb-6 leading-tight">
            نحن نؤمن بأن كل علامة تجارية
            <br />
            <span className="text-primary">تستحق الأفضل</span>
          </h1>
          <p className="text-gray-500 text-xl leading-relaxed max-w-2xl">
            Service Serigraphie هو خدمة طباعة جزائرية متخصصة في تقديم خدمات السيريغرافي والطباعة للشركات والمؤسسات في جميع أنحاء الجزائر.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-right space-y-6">
              <h2 className="text-3xl font-black text-gray-900">مهمتنا</h2>
              <p className="text-gray-600 leading-loose text-lg">
                نسعى لتوفير أفضل تجربة تسوق إلكترونية للمستهلك الجزائري، بجودة عالية، أسعار تنافسية، وتوصيل سريع لكل بيت في الجزائر.
              </p>
              <p className="text-gray-600 leading-loose">
                نؤمن بأن التجارة الإلكترونية المحلية يجب أن تكون بسيطة، موثوقة، وسريعة — لذلك بنينا نظاماً بدون سلة مشتريات معقدة، يمكنك من الطلب بـ 3 نقرات فقط.
              </p>
              <div className="space-y-3">
                {[
                  "جودة مضمونة في كل منتج",
                  "توصيل لـ 58 ولاية جزائرية",
                  "الدفع عند الاستلام (COD)",
                  "دعم العملاء على مدار الساعة",
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 size={20} className="text-primary shrink-0" />
                    <span className="font-medium text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { num: "+500", label: "عميل راضٍ" },
                { num: "58", label: "ولاية تغطيها" },
                { num: "+200", label: "منتج متاح" },
                { num: "3", label: "سنوات خبرة" },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 rounded-3xl p-8 text-center border border-gray-100">
                  <p className="text-4xl font-black text-primary mb-2">{stat.num}</p>
                  <p className="text-gray-600 font-bold text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-gray-900 mb-4">قيمنا</h2>
            <p className="text-gray-500">المبادئ التي تحكم عملنا يومياً</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Award, title: "الجودة أولاً", desc: "نختار بعناية كل منتج نبيعه لضمان رضاك التام" },
              { icon: Truck, title: "التوصيل السريع", desc: "نوصل لبابك في أسرع وقت بتكلفة منافسة" },
              { icon: ShieldCheck, title: "الأمان والثقة", desc: "تسوق بأمان مع نظام الدفع عند الاستلام" },
              { icon: HeadphonesIcon, title: "دعم متواصل", desc: "فريق خدمة العملاء جاهز للرد على استفساراتك" },
            ].map(val => (
              <div key={val.title} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all text-right group">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                  <val.icon size={28} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-3">{val.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-950 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-black mb-4">جاهز للطلب؟</h2>
          <p className="text-gray-400 mb-8 text-lg">اكتشف تشكيلتنا الواسعة وأطلب الآن بـ 3 نقرات فقط</p>
          <Link
            href="/products"
            className="inline-flex items-center gap-3 bg-primary text-white px-10 py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/30"
          >
            <span>تسوق الآن</span>
            <ArrowLeft size={20} />
          </Link>
        </div>
      </section>
      <Footer />
      <WhatsAppButton />
    </main>
  );
}
