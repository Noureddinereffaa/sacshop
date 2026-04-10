"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import { 
  Phone, Package, Crown, Calendar, Loader2, 
  Gift, Percent, AlarmClock, ShoppingBag, Tag,
  CheckCircle2, ArrowLeft, Star
} from "lucide-react";
import { CustomerData, OrderItem } from "@/types";
import Link from "next/link";

interface VipOffer {
  id: string;
  title: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  expires_at: string | null;
}

export default function CustomerPortalPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [vipOffers, setVipOffers] = useState<VipOffer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneNumber.trim() })
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "خطأ في الاتصال");
      } else {
        setCustomerData(data.customer);
        setOrders(data.orders);
        setVipOffers(data.vipOffers || []);
      }
    } catch {
      setErrorMsg("حدث خطأ في النظام. يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":        return "bg-blue-100 text-blue-700";
      case "confirmed":  return "bg-indigo-100 text-indigo-700";
      case "processing": return "bg-orange-100 text-orange-700";
      case "shipped":    return "bg-purple-100 text-purple-700";
      case "delivered":  return "bg-green-100 text-green-700";
      case "cancelled":  return "bg-red-100 text-red-700";
      default:           return "bg-gray-100 text-gray-700";
    }
  };
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new":        return "جديد";
      case "confirmed":  return "مؤكد";
      case "processing": return "قيد التجهيز";
      case "shipped":    return "تم الشحن";
      case "delivered":  return "مكتمل";
      case "cancelled":  return "ملغى";
      default:           return status;
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-grow container mx-auto px-4 py-12 md:py-20 max-w-4xl text-right" dir="rtl">

        {!customerData ? (
          /* ─── Login Form ─────────────────────────────────── */
          <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl border border-gray-100 max-w-md mx-auto text-center relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-6">
              <Phone size={36} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">حسابي</h1>
            <p className="text-gray-500 mb-8 font-medium">
              أدخل رقم هاتفك للوصول إلى حسابك، مشاهدة طلباتك السابقة، وعروضك الحصرية.
            </p>

            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 font-bold text-sm">
                {errorMsg === "Customer not found"
                  ? "لم نجد أي حساب بهذا الرقم. تأكد من الرقم الذي استخدمته في طلباتك."
                  : errorMsg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-right">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 block mr-1">رقم الهاتف</label>
                <div className="relative">
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    required
                    type="tel"
                    dir="ltr"
                    placeholder="05 / 06 / 07 XX XX XX XX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 transition-all font-bold text-right"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : "الدخول إلى حسابي"}
              </button>
            </form>
          </div>

        ) : (
          /* ─── Customer Portal Dashboard ──────────────────── */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

            {/* Identity Card */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full pointer-events-none" />

              <div className="flex items-center gap-6 z-10 w-full md:w-auto">
                <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary shrink-0 border-2 border-white shadow-md text-3xl font-black">
                  {customerData.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">{customerData.name}</h2>
                    {customerData.is_vip && (
                      <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 shadow-sm border border-yellow-200">
                        <Crown size={14} /> زبون مميز
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 font-medium" dir="ltr">{customerData.phone}</p>
                </div>
              </div>

              <div className="flex gap-6 md:gap-10 w-full md:w-auto bg-gray-50 p-5 md:p-6 rounded-3xl z-10">
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter mb-1">إجمالي الإنفاق</p>
                  <p className="text-xl md:text-2xl font-black text-primary">{customerData.total_spent || 0} د.ج</p>
                </div>
                <div className="w-px bg-gray-200" />
                <div>
                  <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter mb-1">عدد الطلبات</p>
                  <p className="text-xl md:text-2xl font-black text-gray-900">{customerData.total_orders || 0}</p>
                </div>
              </div>
            </div>

            {/* ─── VIP Offers Section ─────────────────────────── */}
            {vipOffers.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <Crown className="text-yellow-600" size={22} />
                  </div>
                  عروضك الحصرية
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {vipOffers.map((offer) => {
                    const isPercentage = offer.discount_type === "percentage";
                    const daysLeft = offer.expires_at
                      ? Math.ceil((new Date(offer.expires_at).getTime() - Date.now()) / 86400000)
                      : null;

                    return (
                      <div
                        key={offer.id}
                        className="relative bg-gradient-to-br from-primary/5 via-white to-yellow-50 border-2 border-primary/20 rounded-[2rem] p-6 overflow-hidden shadow-lg hover:shadow-xl transition-all group"
                      >
                        {/* Background badge */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/5 rounded-full pointer-events-none" />
                        <div className="absolute top-4 left-4">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        </div>

                        {/* Discount callout */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className={`px-4 py-2 rounded-2xl font-black text-lg shadow-inner shrink-0 ${
                            isPercentage
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            {isPercentage
                              ? <span className="flex items-center gap-1"><Percent size={16} />{offer.discount_value}%</span>
                              : <span className="flex items-center gap-1"><Tag size={14} />{offer.discount_value} د.ج</span>
                            }
                          </div>

                          {daysLeft !== null && (
                            <span className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-full ${
                              daysLeft <= 3 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                            }`}>
                              <AlarmClock size={12} />
                              {daysLeft <= 0 ? "ينتهي اليوم!" : `${daysLeft} يوم متبقي`}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xl font-black text-gray-900 mb-2 group-hover:text-primary transition-colors">
                          {offer.title}
                        </h4>
                        {offer.description && (
                          <p className="text-gray-500 text-sm leading-relaxed mb-5">{offer.description}</p>
                        )}

                        <Link href="/products" className="w-full block">
                          <button className="w-full bg-primary text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all text-sm">
                            <ShoppingBag size={16} />
                            تسوق الآن بالخصم
                            <ArrowLeft size={14} />
                          </button>
                        </Link>
                      </div>
                    );
                  })}
                </div>

                {/* Cart discount reminder */}
                <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center shrink-0 text-primary">
                    <Gift size={20} />
                  </div>
                  <div>
                    <p className="font-black text-gray-800 mb-1">تذكير: خصم إضافي عند إنشاء السلة</p>
                    <p className="text-gray-500 text-sm font-medium">
                      أضف منتجين أو أكثر إلى سلة مشترياتك للاستفادة من خصم السلة التلقائي إضافةً إلى عروضك الحصرية.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Progress to next VIP level */}
            {!customerData.is_vip && (customerData.total_orders || 0) < 2 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-center gap-4">
                <CheckCircle2 className="text-yellow-500 shrink-0" size={24} />
                <div className="flex-1">
                  <p className="font-black text-yellow-800">طريقك نحو العروض الحصرية!</p>
                  <p className="text-yellow-700 text-sm font-medium mt-1">
                    أكمل {2 - (customerData.total_orders || 0)} طلب{(2 - (customerData.total_orders || 0)) > 1 ? "ات" : ""} إضافية للحصول على وضع &quot;الزبون المميز&quot; وعروض حصرية لك.
                  </p>
                </div>
                <div className="shrink-0 text-center">
                  <p className="text-2xl font-black text-yellow-700">{customerData.total_orders || 0}/2</p>
                  <p className="text-xs text-yellow-600 font-bold">طلبات</p>
                </div>
              </div>
            )}

            {/* ─── Orders History ─────────────────────────────── */}
            <div>
              <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Package className="text-primary" size={22} />
                </div>
                سجل طلباتي
              </h3>

              <div className="grid grid-cols-1 gap-5">
                {orders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                    <Package size={48} className="mx-auto mb-4 text-gray-200" />
                    <p className="text-gray-400 font-bold">لا توجد طلبات مسجلة بعد.</p>
                  </div>
                ) : (
                  orders.map((order) => {
                    const isCart = order.cart_items && order.cart_items.length > 0;
                    return (
                      <div key={order.id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border-b border-gray-50 bg-gray-50/50 gap-4">
                          <div className="flex items-center gap-4">
                            <div className="bg-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xs text-primary shadow-sm border border-gray-100">
                              #{order.id.split("-")[0]}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400" />
                                {new Date(order.created_at).toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" })}
                              </p>
                              {order.admin_notes && (
                                <p className="text-xs text-gray-500 mt-1 font-medium">ملاحظاتك: {order.admin_notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                            <span className="font-black text-xl text-gray-900">{order.total_price} د.ج</span>
                            <span className={`px-4 py-2 rounded-xl text-sm font-bold ${getStatusColor(order.status)}`}>
                              {getStatusLabel(order.status)}
                            </span>
                          </div>
                        </div>

                        <div className="p-6">
                          {isCart ? (
                            <div className="space-y-3">
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {order.cart_items.map((item: any, idx: number) => (
                                <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                                  <div>
                                    <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                                    {item.size && <p className="text-xs text-gray-500 mt-0.5">{item.size} {item.color ? `| ${item.color}` : ""}</p>}
                                  </div>
                                  <span className="font-black text-gray-600 bg-white px-3 py-1 rounded-lg border border-gray-200">
                                    الكمية: {item.quantity}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                              <div>
                                <p className="font-bold text-gray-800">حزمة مطبوعات مخصصة</p>
                                {order.size && <p className="text-xs text-gray-500 mt-0.5">{order.size} {order.color ? `| ${order.color}` : ""}</p>}
                              </div>
                              <span className="font-black text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm">
                                الكمية: {order.quantity}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="pt-4 text-center">
              <button
                onClick={() => { setCustomerData(null); setPhoneNumber(""); setVipOffers([]); }}
                className="text-gray-400 font-bold hover:text-primary transition-colors text-sm"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
