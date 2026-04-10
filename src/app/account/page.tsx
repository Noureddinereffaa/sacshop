"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Crown, Package, Calendar, Gift, Percent, Tag,
  AlarmClock, ShoppingBag, ArrowLeft, Star, CheckCircle2,
  Loader2, MessageCircle, Phone, Lock, Eye, EyeOff
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  total_orders: number;
  total_spent: number;
  is_vip: boolean;
}
interface OrderItem {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  admin_notes?: string;
  size?: string;
  color?: string;
  quantity: number;
  cart_items?: Array<{ name: string; quantity: number; size?: string; color?: string }>;
}
interface VipOffer {
  id: string;
  title: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  expires_at: string | null;
}

// ─── Status helpers ────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  new:        { label: "جديد",         color: "bg-blue-100 text-blue-700" },
  confirmed:  { label: "مؤكد",         color: "bg-indigo-100 text-indigo-700" },
  processing: { label: "قيد التجهيز",  color: "bg-orange-100 text-orange-700" },
  shipped:    { label: "تم الشحن",     color: "bg-purple-100 text-purple-700" },
  delivered:  { label: "مكتمل",        color: "bg-green-100 text-green-700" },
  cancelled:  { label: "ملغى",         color: "bg-red-100 text-red-700" },
};

// ─── Login sub-form (for returning visitors coming directly to /account) ───────
function LoginForm({ onSuccess }: { onSuccess: (phone: string, name: string) => void }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      // We verify by fetching customer with phone — if found, we consider it valid.
      // In a full-auth flow, you'd verify password with Supabase signInWithPassword.
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("لم يتم العثور على حساب بهذا الرقم.");
      sessionStorage.setItem("sacshop_phone", phone.trim());
      sessionStorage.setItem("sacshop_name", data.customer.name);
      onSuccess(phone.trim(), data.customer.name);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "خطأ في الدخول");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 max-w-md mx-auto relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-56 h-56 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-5">
          <Phone size={30} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">الدخول إلى حسابي</h1>
        <p className="text-gray-500 text-sm font-medium">أدخل رقم هاتفك لعرض طلباتك وعروضك الحصرية</p>
      </div>
      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-5 font-bold text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4 text-right" dir="rtl">
        <div className="space-y-2">
          <label className="text-sm font-black text-gray-700">رقم الهاتف</label>
          <div className="relative">
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input required type="tel" dir="ltr" placeholder="05 / 06 / 07 XX XX XX"
              value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-black text-gray-700">كلمة السر</label>
          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input required type={showPwd ? "text" : "password"} placeholder="كلمة السر"
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-12 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
            <button type="button" onClick={() => setShowPwd(v => !v)}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary">
              {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={isLoading}
          className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60">
          {isLoading ? <><Loader2 className="animate-spin" size={20} />جاري الدخول...</> : "الدخول إلى حسابي"}
        </button>
      </form>
      <p className="text-center text-xs text-gray-400 font-bold mt-6">
        لا تملك حساباً؟{" "}
        <Link href="/products" className="text-primary hover:underline">اطلب الآن لإنشاء حساب تلقائي</Link>
      </p>
    </div>
  );
}

// ─── Main account content ──────────────────────────────────────────────────────
function AccountContent() {
  const params    = useSearchParams();
  const router    = useRouter();
  const waLink    = decodeURIComponent(params.get("wa") || "");
  const refId     = params.get("ref") || "";

  const [phone, setPhone]           = useState<string | null>(null);
  const [customerData, setCustomer] = useState<CustomerData | null>(null);
  const [orders, setOrders]         = useState<OrderItem[]>([]);
  const [vipOffers, setVipOffers]   = useState<VipOffer[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [isReady, setIsReady]       = useState(false);

  // Hydrate phone from sessionStorage after mount
  useEffect(() => {
    const storedPhone = sessionStorage.getItem("sacshop_phone");
    setPhone(storedPhone);
    setIsReady(true);
  }, []);

  // Fetch customer data when phone is available
  useEffect(() => {
    if (!phone) { setIsLoading(false); return; }
    setIsLoading(true);
    fetch("/api/customer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })
      .then(r => r.json())
      .then(d => {
        if (d.customer) {
          setCustomer(d.customer);
          setOrders(d.orders || []);
          setVipOffers(d.vipOffers || []);
        }
      })
      .finally(() => setIsLoading(false));
  }, [phone]);

  const logout = () => {
    sessionStorage.removeItem("sacshop_phone");
    sessionStorage.removeItem("sacshop_name");
    router.push("/");
  };

  // Not ready yet (SSR hydration)
  if (!isReady) return null;

  // No session → show login form
  if (!phone) {
    return (
      <div className="flex-grow flex items-center justify-center px-4 py-16">
        <LoginForm onSuccess={(ph) => setPhone(ph)} />
      </div>
    );
  }

  // Loading customer data
  if (isLoading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-gray-500 font-bold">جاري تحميل بياناتك...</p>
        </div>
      </div>
    );
  }

  // Customer not found via API
  if (!customerData) {
    return (
      <div className="flex-grow flex items-center justify-center px-4 py-16">
        <LoginForm onSuccess={(ph) => setPhone(ph)} />
      </div>
    );
  }

  return (
    <div className="flex-grow container mx-auto px-4 py-10 md:py-16 max-w-4xl text-right space-y-8" dir="rtl">

      {/* ── WhatsApp Confirm CTA (shown immediately after new order) ────────── */}
      {waLink && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#25D366] rounded-[2.5rem] p-7 md:p-10 shadow-2xl shadow-[#25D366]/30 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <MessageCircle size={26} className="text-white" />
                </div>
                <span className="bg-white/20 text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                  خطوة أخيرة
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-white mb-2">
                أكّد طلبك الآن عبر واتساب!
              </h2>
              <p className="text-white/80 font-medium text-sm max-w-sm leading-relaxed">
                طلبك مسجّل في نظامنا. اضغط على الزر لفتح واتساب وإرسال التفاصيل لفريقنا لبدء التنفيذ.
              </p>
              {refId && (
                <p className="text-white/70 text-xs font-bold mt-2">
                  رقم المرجع: <span className="text-white font-black">#{refId.toUpperCase()}</span>
                </p>
              )}
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto shrink-0 bg-white text-[#25D366] px-10 py-5 rounded-2xl font-black text-lg hover:bg-green-50 transition-all shadow-xl flex items-center justify-center gap-3 group"
            >
              <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
              تأكيد عبر واتساب
              <ArrowLeft size={18} />
            </a>
          </div>
        </motion.div>
      )}

      {/* ── Identity Card ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-full pointer-events-none" />
        <div className="flex items-center gap-6 z-10 w-full md:w-auto">
          <div className="w-20 h-20 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary text-3xl font-black shrink-0 border-2 border-white shadow-md">
            {customerData.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">{customerData.name}</h2>
              {customerData.is_vip && (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1 border border-yellow-200">
                  <Crown size={13} /> زبون مميز
                </span>
              )}
            </div>
            <p className="text-gray-500 font-medium" dir="ltr">{customerData.phone}</p>
          </div>
        </div>
        <div className="flex gap-6 md:gap-10 w-full md:w-auto bg-gray-50 p-5 md:p-6 rounded-3xl z-10">
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter mb-1">إجمالي الإنفاق</p>
            <p className="text-xl md:text-2xl font-black text-primary">{customerData.total_spent || 0} د.ج</p>
          </div>
          <div className="w-px bg-gray-200" />
          <div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-tighter mb-1">عدد الطلبات</p>
            <p className="text-xl md:text-2xl font-black text-gray-900">{customerData.total_orders || 0}</p>
          </div>
        </div>
      </div>

      {/* ── VIP Offers ─────────────────────────────────────────────────────── */}
      {vipOffers.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Crown className="text-yellow-600" size={19} />
            </div>
            عروضك الحصرية
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {vipOffers.map(offer => {
              const daysLeft = offer.expires_at
                ? Math.ceil((new Date(offer.expires_at).getTime() - Date.now()) / 86400000)
                : null;
              return (
                <div key={offer.id}
                  className="relative bg-gradient-to-br from-primary/5 via-white to-yellow-50 border-2 border-primary/20 rounded-[2rem] p-6 shadow-lg hover:shadow-xl transition-all group overflow-hidden">
                  <Star size={12} className="absolute top-4 left-4 text-yellow-400 fill-yellow-400" />
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className={`px-4 py-2 rounded-2xl font-black text-lg shadow-inner shrink-0 ${offer.discount_type === "percentage" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {offer.discount_type === "percentage"
                        ? <span className="flex items-center gap-1"><Percent size={16} />{offer.discount_value}%</span>
                        : <span className="flex items-center gap-1"><Tag size={14} />{offer.discount_value} د.ج</span>}
                    </div>
                    {daysLeft !== null && (
                      <span className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-full ${daysLeft <= 3 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                        <AlarmClock size={12} />
                        {daysLeft <= 0 ? "ينتهي اليوم!" : `${daysLeft} يوم`}
                      </span>
                    )}
                  </div>
                  <h4 className="text-lg font-black text-gray-900 mb-2 group-hover:text-primary transition-colors">{offer.title}</h4>
                  {offer.description && <p className="text-gray-500 text-sm mb-5">{offer.description}</p>}
                  <Link href="/products" className="block w-full">
                    <button className="w-full bg-primary text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 text-sm">
                      <ShoppingBag size={16} /> تسوق الآن بالخصم <ArrowLeft size={14} />
                    </button>
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center shrink-0 text-primary">
              <Gift size={20} />
            </div>
            <div>
              <p className="font-black text-gray-800 mb-1">تذكير: خصم إضافي عند إنشاء السلة</p>
              <p className="text-gray-500 text-sm">أضف منتجين أو أكثر إلى سلتك للحصول على خصم السلة التلقائي إضافةً إلى عروضك الحصرية.</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress to VIP */}
      {!customerData.is_vip && (customerData.total_orders || 0) < 2 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex items-center gap-4">
          <CheckCircle2 className="text-yellow-500 shrink-0" size={24} />
          <div className="flex-1">
            <p className="font-black text-yellow-800">طريقك نحو الزبون المميز!</p>
            <p className="text-yellow-700 text-sm font-medium mt-1">
              طلب واحد إضافي <span className="font-black">{2 - (customerData.total_orders || 0)}</span> للحصول على وضع المميز وعروض حصرية.
            </p>
          </div>
          <p className="text-2xl font-black text-yellow-700 shrink-0">{customerData.total_orders || 0}/2</p>
        </div>
      )}

      {/* ── Orders History ─────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
            <Package className="text-primary" size={19} />
          </div>
          سجل طلباتي
        </h3>
        <div className="grid gap-5">
          {orders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
              <Package size={48} className="mx-auto mb-4 text-gray-200" />
              <p className="text-gray-400 font-bold">لا توجد طلبات مسجلة بعد.</p>
            </div>
          ) : orders.map(order => {
            const st = STATUS_MAP[order.status] || STATUS_MAP.new;
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
                      {order.admin_notes && <p className="text-xs text-gray-500 mt-1">{order.admin_notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <span className="font-black text-xl text-gray-900">{order.total_price} د.ج</span>
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${st.color}`}>{st.label}</span>
                  </div>
                </div>
                <div className="p-6">
                  {isCart ? (
                    <div className="space-y-3">
                      {order.cart_items!.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <div>
                            <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                            {item.size && <p className="text-xs text-gray-500">{item.size} {item.color ? `| ${item.color}` : ""}</p>}
                          </div>
                          <span className="font-black text-gray-600 bg-white px-3 py-1 rounded-lg border border-gray-200 text-sm">
                            الكمية: {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-800">حزمة مطبوعات مخصصة</p>
                        {order.size && <p className="text-xs text-gray-500">{order.size} {order.color ? `| ${order.color}` : ""}</p>}
                      </div>
                      <span className="font-black text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm">
                        الكمية: {order.quantity}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="pt-4 text-center pb-8">
        <button onClick={logout} className="text-gray-400 font-bold hover:text-primary transition-colors text-sm">
          تسجيل الخروج
        </button>
      </div>
    </div>
  );
}

// ─── Page wrapper ──────────────────────────────────────────────────────────────
export default function AccountPage() {
  return (
    <main className="min-h-screen bg-gray-50/50 flex flex-col">
      <Header />
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      }>
        <AccountContent />
      </Suspense>
      <Footer />
    </main>
  );
}
