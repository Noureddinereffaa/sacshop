"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { Search, Package, CheckCircle2, Truck, Clock } from "lucide-react";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<any>(null);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for tracking order would go here
    // For now, let's show a mock status
    if (orderId) {
      setStatus({
        id: orderId,
        customer: "محمد علي",
        currentStatus: "shipped",
        date: "2024-03-15",
        steps: [
          { status: "confirmed", label: "تم تأكيد الطلب", date: "15 مارس", completed: true },
          { status: "processing", label: "قيد التجهيز", date: "16 مارس", completed: true },
          { status: "shipped", label: "تم الشحن", date: "17 مارس", completed: true },
          { status: "delivered", label: "تم التسليم", date: "--", completed: false },
        ]
      });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-grow container mx-auto px-4 py-24 max-w-2xl text-right" dir="rtl">
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-black text-gray-900 mb-2">تتبع طلبك</h1>
          <p className="text-gray-500 mb-8 text-lg">أدخل رقم الطلب المرسل إليك في البريد الإلكتروني لمتابعة حالته.</p>

          <form onSubmit={handleTrack} className="flex gap-2 mb-10">
            <button 
              type="submit" 
              className="bg-primary text-white px-8 rounded-xl font-bold hover:bg-primary/90 transition-all shrink-0"
            >
              تتبع الآن
            </button>
            <div className="relative flex-grow">
              <input 
                type="text" 
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="مثال: #ORD-12345"
                className="w-full px-4 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none text-right pr-4"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
          </form>

          {status && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">حالة الطلب الحالية</p>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold text-sm">
                    تم الشحن
                  </span>
                </div>
                <Package className="text-primary w-10 h-10" />
              </div>

              <div className="relative pr-8 border-r-2 border-gray-100 space-y-12 mr-4">
                {status.steps.map((step: any, index: number) => (
                  <div key={index} className="relative">
                    <div className={`absolute -right-[41px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-sm ${step.completed ? 'bg-primary' : 'bg-gray-200'}`} />
                    <div className="flex flex-col">
                      <span className={`text-lg font-bold ${step.completed ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </span>
                      <span className="text-sm text-gray-500">{step.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-gray-100 text-center">
                <p className="text-gray-500 text-sm">إذا كان لديك أي استفسار، يرجى الاتصال بخدمة العملاء.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
