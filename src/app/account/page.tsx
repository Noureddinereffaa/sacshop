"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Crown, Package, Calendar, Gift, Percent, Tag,
  AlarmClock, ShoppingBag, ArrowLeft, Star, CheckCircle2,
  Loader2, MessageCircle, Phone, Lock, Eye, EyeOff, Check,
  Truck, Clock, ShieldCheck, UserCircle, ArrowRight
} from "lucide-react";
import Link from "next/link";

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  total_orders: number;
  total_spent: number;
  is_vip: boolean;
  star_level: number;
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
const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new:        { label: "جديد",         color: "bg-blue-100 text-blue-700", icon: <Clock size={16} /> },
  confirmed:  { label: "مؤكد",         color: "bg-indigo-100 text-indigo-700", icon: <CheckCircle2 size={16} /> },
  processing: { label: "قيد التجهيز",  color: "bg-orange-100 text-orange-700", icon: <Package size={16} /> },
  shipped:    { label: "تم الشحن",     color: "bg-purple-100 text-purple-700", icon: <Truck size={16} /> },
  delivered:  { label: "مكتمل",        color: "bg-green-100 text-green-700", icon: <CheckCircle2 size={16} /> },
  cancelled:  { label: "ملغى",         color: "bg-red-100 text-red-700", icon: <Clock size={16} /> },
};

const TIMELINE_STEPS = ["new", "confirmed", "processing", "shipped", "delivered"];

// ─── Helper to parse notes ───────────────────────────────────────────────────
function parseOrderNotes(notes?: string) {
  if (!notes) return { displayNotes: null, pdfUrl: null };
  
  let displayNotes = notes;
  let pdfUrl = null;

  // Extract PDF URL if it exists (saved as pdf_url:URL)
  const pdfMatch = notes.match(/pdf_url:(https?:\/\/\S+)/);
  if (pdfMatch) {
    pdfUrl = pdfMatch[1];
    displayNotes = displayNotes.replace(/pdf_url:https:\/\/\S+/, "");
  }

  // Hide internal WhatsApp technical markers
  if (displayNotes.includes("__wa_message__")) {
    const parts = displayNotes.split("__wa_message__");
    displayNotes = parts[0].trim(); // Only show what was before the technical marker
  }

  return { 
    displayNotes: displayNotes.trim() || null, 
    pdfUrl 
  };
}

// ─── Login sub-form (for returning visitors coming directly to /account) ───────
function LoginForm({ onSuccess }: { onSuccess: (phone: string, name: string) => void }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!name.trim()) throw new Error("يرجى إدخال الاسم الكامل");
      const dzPhoneRegex = /^(05|06|07)[0-9]{8}$/;
      if (!dzPhoneRegex.test(phone.trim())) {
         throw new Error("يرجى إدخال رقم هاتف جزائري صحيح يبدأ بـ 05 أو 06 أو 07");
      }
      // We verify by fetching customer with phone — if found, we consider it valid.
      // In a full-auth flow, you'd verify password with Supabase signInWithPassword.
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("لم يتم العثور على حساب بهذا الرقم.");
      sessionStorage.setItem("servseri_phone", phone.trim());
      sessionStorage.setItem("servseri_name", data.customer.name);
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
          <label className="text-sm font-black text-gray-700">الاسم الكامل</label>
          <div className="relative">
            <UserCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input required type="text" placeholder="مثال: محمد العمري"
              value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-black text-gray-700">رقم الهاتف</label>
          <div className="relative">
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input required type="tel" dir="ltr" placeholder="05 / 06 / 07 XX XX XX"
              value={phone} onChange={e => setPhone(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-4 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
          </div>
        </div>

        <button type="submit" disabled={isLoading}
          className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60">
          {isLoading ? <><Loader2 className="animate-spin" size={20} />جاري الدخول...</> : "الدخول إلى حسابي"}
        </button>
      </form>
      <p className="text-center text-xs text-gray-400 font-bold mt-8">
        بمجرد إدخال رقم هاتفك، ستتمكن من رؤية تاريخ طلباتك بالكامل.
      </p>

      <div className="mt-8 text-center relative z-10">
         <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
            <span>العودة للمتجر</span>
            <ArrowRight size={14} className="rotate-180" />
         </Link>
      </div>

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
  const [waClicked, setWaClicked]   = useState(false);
  const [activeTab, setActiveTab]   = useState<"orders" | "settings">("orders");
  const [isUpdating, setIsUpdating] = useState(false);

  // Hydrate phone from sessionStorage after mount
  useEffect(() => {
    const storedPhone = sessionStorage.getItem("servseri_phone");
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
    sessionStorage.removeItem("servseri_phone");
    sessionStorage.removeItem("servseri_name");
    router.push("/");
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customerData) return;
    setIsUpdating(true);
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const data = {
        id: customerData.id,
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        address: formData.get("address"),
      };

      const res = await fetch("/api/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setCustomer({ ...customerData, ...data } as any);
        sessionStorage.setItem("servseri_phone", data.phone as string);
        sessionStorage.setItem("servseri_name", data.name as string);
        alert("تم تحديث البيانات بنجاح ✅");
      } else {
        alert("فشل تحديث البيانات ❌");
      }
    } catch (err) {
      alert("حدث خطأ غير متوقع");
    } finally {
      setIsUpdating(false);
    }
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
    <div className="flex-grow container mx-auto px-4 py-10 md:py-16 max-w-4xl text-right space-y-10" dir="rtl">
      
      {/* ── Tabs Navigation ────────── */}
      <div className="flex items-center justify-center p-1.5 bg-gray-100 rounded-2xl w-full max-w-sm mx-auto mb-10">
        <button 
          onClick={() => setActiveTab("orders")}
          className={`flex-1 py-3 text-sm font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "orders" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Package size={18} />
          طلباتي
        </button>
        <button 
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-3 text-sm font-black rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            activeTab === "settings" ? "bg-white text-primary shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <UserCircle size={18} />
          إعدادات الملف
        </button>
      </div>

      {activeTab === "settings" ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-gray-100 max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <UserCircle size={28} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">تعديل ملفك الشخصي</h2>
              <p className="text-gray-500 text-sm">أكمل بياناتك لنقوم بخدمتك بشكل أفضل</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 block">الاسم الكامل</label>
                <input 
                  name="name"
                  defaultValue={customerData.name}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-5 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700 block">رقم الهاتف</label>
                <input 
                  name="phone"
                  defaultValue={customerData.phone}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-5 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-left"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 block">البريد الإلكتروني</label>
              <input 
                name="email"
                type="email"
                defaultValue={customerData.email}
                placeholder="example@email.com"
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-5 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-left"
                dir="ltr"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700 block">العنوان الافتراضي</label>
              <textarea 
                name="address"
                defaultValue={customerData.address}
                placeholder="اذكر ولاية، بلدية، وعنوانك المفصل..."
                className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 px-5 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-32 resize-none"
              />
            </div>

            <button 
              type="submit" 
              disabled={isUpdating}
              className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-60"
            >
              {isUpdating ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={24} />}
              حفظ التغييرات
            </button>
          </form>

          <button 
            onClick={logout}
            className="w-full mt-6 py-4 text-red-500 font-bold text-sm hover:bg-red-50 rounded-2xl transition-colors"
          >
            تسجيل الخروج من هذا الجهاز
          </button>
        </motion.div>
      ) : (
        <>

      {/* ── WhatsApp Confirm CTA (shown immediately after new order) ────────── */}
      {waLink && !waClicked && (
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
              onClick={() => {
                setWaClicked(true);
                // Clear the URL parameters without triggering a page reload, 
                // so the banner doesn't reappear on refresh
                window.history.replaceState(null, '', '/account');
              }}
              className="w-full md:w-auto shrink-0 bg-white text-[#25D366] px-10 py-5 rounded-2xl font-black text-lg hover:bg-green-50 transition-all shadow-xl flex items-center justify-center gap-3 group"
            >
              <MessageCircle size={24} className="group-hover:scale-110 transition-transform" />
              تأكيد عبر واتساب
              <ArrowLeft size={18} />
            </a>
          </div>
        </motion.div>
      )}

      {waLink && waClicked && (
        <motion.div
           initial={{ opacity: 0, y: -10 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-green-50 border-2 border-green-200 rounded-3xl p-6 shadow-sm flex items-center gap-5"
        >
          <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
            <CheckCircle2 size={32} className="text-green-600" />
          </div>
          <div>
             <p className="text-green-800 font-black text-lg">شكراً لك! طلبك الآن في طور التأكيد.</p>
             <p className="text-green-700 text-sm font-medium mt-0.5">لقد قمت بإرسال تفاصيل الطلب بنجاح. سيتم مراجعته قريباً وتحديث حالته هنا.</p>
          </div>
        </motion.div>
      )}

      {/* ── Identity Card ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-primary/20 flex flex-col md:flex-row items-center gap-8 justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 z-10 w-full md:w-auto">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-white text-4xl font-black shrink-0 border-2 border-white/30 shadow-inner">
            {customerData.name.charAt(0)}
          </div>
          <div className="text-center md:text-right mt-2">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3 mb-2 flex-wrap justify-center md:justify-start">
              <h2 className="text-3xl md:text-4xl font-black text-white">{customerData.name}</h2>
              {customerData.star_level > 0 && (
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 shadow-lg">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={`${i < customerData.star_level ? "text-yellow-400 fill-yellow-400" : "text-white/30"} transition-all duration-700`} 
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mt-2">
               <p className="text-white/80 font-medium flex items-center gap-2" dir="ltr">
                 <Phone size={14} className="opacity-70" /> {customerData.phone}
               </p>
               <span className="w-1.5 h-1.5 bg-white/30 rounded-full" />
               <p className="text-white font-black text-xs uppercase tracking-widest">
                 {customerData.star_level === 5 ? "عضو ملكي (5 نجوم)" : 
                  customerData.star_level === 4 ? "عضو ماسي (4 نجوم)" :
                  customerData.star_level === 3 ? "عضو ذهبي (3 نجوم)" :
                  customerData.star_level === 2 ? "عضو فضي (2 نجوم)" :
                  customerData.star_level === 1 ? "عضو برونزي (نجمة واحدة)" : "عضو جديد"}
               </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 md:gap-8 w-full md:w-auto bg-white/10 backdrop-blur-md p-6 rounded-[2rem] z-10 border border-white/20">
          <div className="text-center md:text-right">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1.5">إجمالي مشترياتك</p>
            <p className="text-2xl md:text-3xl font-black text-white">{customerData.total_spent || 0} <span className="text-sm opacity-80">د.ج</span></p>
          </div>
          <div className="w-px bg-white/20" />
          <div className="text-center md:text-right">
            <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1.5">سجل الشراء</p>
            <p className="text-2xl md:text-3xl font-black text-white">{customerData.total_orders || 0} <span className="text-sm opacity-80">طلبات</span></p>
          </div>
        </div>
      </div>

      {/* ── VIP Offers & Loyalty Progress ─────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Progress to next star */}
        {customerData.star_level < 5 && (
          <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 shadow-inner">
                  <Star size={24} className="fill-yellow-600" />
                </div>
                <div>
                  <p className="font-black text-gray-900">طريقك نحو النجمة {customerData.star_level + 1}!</p>
                  <p className="text-gray-500 text-sm">تبقّى لك طلب واحد فقط لرفع مستواك وفتح عروض أقوى.</p>
                </div>
              </div>
              <div className="flex-1 max-w-xs w-full">
                <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                  <span>المستوى {customerData.star_level}</span>
                  <span>المستوى {customerData.star_level + 1}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100 shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "50%" }} // Simple logic: one more order needed
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full shadow-lg shadow-yellow-500/20"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {vipOffers.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Crown className="text-yellow-600" size={19} />
              </div>
              عروضك الحصرية كعضو {customerData.star_level} ⭐
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {vipOffers.map(offer => {
                const daysLeft = offer.expires_at
                  ? Math.ceil((new Date(offer.expires_at).getTime() - Date.now()) / 86400000)
                  : null;
                return (
                  <div key={offer.id}
                    className="relative bg-gradient-to-br from-white via-white to-yellow-50/50 border-2 border-yellow-200/50 rounded-[2.5rem] p-7 shadow-xl shadow-yellow-500/5 hover:shadow-2xl hover:border-yellow-300 transition-all group overflow-hidden">
                    <div className="absolute top-0 left-0 w-32 h-32 bg-yellow-400/5 rounded-full blur-3xl -ml-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                    
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className={`px-5 py-3 rounded-2xl font-black text-2xl shadow-lg border border-white group-hover:scale-110 transition-transform ${offer.discount_type === "percentage" ? "bg-gradient-to-br from-green-500 to-green-600 text-white" : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"}`}>
                        {offer.discount_type === "percentage"
                          ? <><span className="text-lg opacity-80">%</span>{offer.discount_value}</>
                          : <><span className="text-lg opacity-80">د.ج</span>{offer.discount_value}</>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {daysLeft !== null && (
                          <span className={`text-[10px] font-black flex items-center gap-1.5 px-3 py-1.5 rounded-full uppercase tracking-wider ${daysLeft <= 3 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                            <AlarmClock size={12} />
                            {daysLeft <= 0 ? "ينتهي اليوم!" : `${daysLeft} يوم متبقي`}
                          </span>
                        )}
                        <span className="text-[10px] bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-black flex items-center gap-1 border border-yellow-200">
                          <Crown size={10} /> عرض VIP
                        </span>
                      </div>
                    </div>
                    
                    <h4 className="text-xl font-black text-gray-950 mb-2 group-hover:text-primary transition-colors">{offer.title}</h4>
                    {offer.description && <p className="text-gray-500 text-sm mb-6 leading-relaxed">{offer.description}</p>}
                    
                    <Link href="/products" className="block w-full">
                      <button className="w-full bg-gray-950 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-primary transition-all shadow-xl active:scale-[0.98]">
                        <ShoppingBag size={20} /> تسوق الآن بالخصم <ArrowLeft size={18} />
                      </button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Progress to next star level (when no VIP offers or explicitly for lower levels) */}
      {customerData.star_level === 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-[2rem] p-8 flex items-center gap-6 group hover:shadow-lg transition-all">
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-yellow-600 shadow-md border border-yellow-100 relative z-10 scale-110">
              <Star size={32} className="fill-yellow-600" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-black text-yellow-900 text-xl mb-1">ابدأ رحلة الولاء الآن!</p>
            <p className="text-yellow-700 font-medium">
               أكمل طلبك الأول (1) واحصل على <span className="font-black underline">النجمة الأولى ⭐</span> لفتح بوابة العروض الحصرية.
            </p>
          </div>
          <div className="hidden md:flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white h-24 w-24 shadow-inner">
             <span className="text-[10px] font-black text-yellow-800 uppercase mb-1">التقدم</span>
             <span className="text-3xl font-black text-yellow-700">0/1</span>
          </div>
        </div>
      )}

      {/* ── Orders History ─────────────────────────────────────────────────── */}
      <div>
        <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center">
            <Package className="text-primary" size={24} />
          </div>
          <span className="bg-gradient-to-l from-gray-900 to-gray-600 bg-clip-text text-transparent">سجل طلباتي ومتابعة الشحن</span>
        </h3>
        
        <div className="grid gap-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-200">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag size={48} className="text-gray-300" />
              </div>
              <h4 className="text-xl font-black text-gray-800 mb-2">لا توجد طلبات مسجلة بعد</h4>
              <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">يبدو أنك لم تقم بأي طلب حتى الآن. اكتشف مطبوعاتنا وعروضنا الحصرية وابدأ الآن.</p>
              <Link href="/products" className="inline-flex bg-primary text-white px-8 py-4 rounded-2xl font-black hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 items-center gap-2">
                تصفح المنتجات <ArrowLeft size={18} />
              </Link>
            </div>
          ) : orders.map(order => {
            const st = STATUS_MAP[order.status] || STATUS_MAP.new;
            const isCart = order.cart_items && order.cart_items.length > 0;
            const currentStepIndex = order.status === "cancelled" ? -1 : TIMELINE_STEPS.indexOf(order.status);
            
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id} 
                className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 md:p-8 border-b border-gray-50 bg-gradient-to-b from-gray-50/50 to-white gap-6">
                  <div className="flex items-center gap-5">
                    <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center font-black text-sm text-primary shadow-sm border border-gray-100 shrink-0">
                      #{order.id.split("-")[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 flex items-center gap-2 mb-1.5 text-sm md:text-base">
                        <Calendar size={14} className="text-gray-400" />
                        {new Date(order.created_at).toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                           const { displayNotes, pdfUrl } = parseOrderNotes(order.admin_notes);
                           return (
                             <>
                               {displayNotes && (
                                 <p className="text-[11px] font-black text-gray-500 bg-gray-100/80 px-3 py-1 rounded-full inline-block">
                                   الملاحظة: {displayNotes}
                                 </p>
                               )}
                               {pdfUrl && (
                                 <a 
                                   href={pdfUrl} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="text-[11px] font-black text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1 rounded-full flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                                 >
                                   <ShieldCheck size={12} /> تحميل الفاتورة الرسمية (PDF)
                                 </a>
                               )}
                             </>
                           )
                        })()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end bg-white md:bg-transparent p-4 md:p-0 rounded-2xl border border-gray-100 md:border-none shadow-sm md:shadow-none">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-0.5">الإجمالي المستحق</p>
                      <span className="font-black text-2xl text-primary">{order.total_price} <span className="text-sm">د.ج</span></span>
                    </div>
                    <div className="h-10 w-px bg-gray-200 hidden md:block" />
                    <span className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-sm ${st.color} border border-black/5`}>
                      {st.icon} {st.label}
                    </span>
                  </div>
                </div>

                {/* Timeline Progress */}
                {order.status !== "cancelled" && (
                  <div className="px-6 md:px-10 py-6 md:py-8 border-b border-gray-50 bg-white">
                    <div className="relative">
                      {/* Line Background */}
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full hidden sm:block" />
                      {/* Active Line Progress */}
                      <div 
                        className="absolute top-1/2 right-0 h-1 bg-primary -translate-y-1/2 rounded-full hidden sm:block transition-all duration-700 ease-in-out" 
                        style={{ width: `${Math.max(0, (currentStepIndex / (TIMELINE_STEPS.length - 1)) * 100)}%` }} 
                      />

                      <div className="relative flex justify-between items-center sm:flex-row flex-col sm:gap-0 gap-6">
                        {TIMELINE_STEPS.map((stepKey, idx) => {
                          const isActive = currentStepIndex >= idx;
                          const isCurrent = currentStepIndex === idx;
                          const stepInfo = STATUS_MAP[stepKey];
                          
                          return (
                            <div key={stepKey} className="flex flex-col items-center gap-3 relative z-10 sm:w-auto w-full">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 font-bold ${
                                  isActive 
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110 ring-4 ring-white" 
                                    : "bg-white border-2 border-gray-200 text-gray-300"
                                }`}>
                                  {isActive ? <Check size={16} /> : <div className="w-2 h-2 rounded-full bg-gray-200" />}
                                </div>
                                <div className="text-center">
                                  <p className={`text-xs font-black transition-colors ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                                    {stepInfo.label}
                                  </p>
                                  {isCurrent && (
                                    <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black block mt-1 animate-pulse">
                                      المرحلة الحالية
                                    </span>
                                  )}
                                </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Body / Items Details */}
                <div className="p-6 md:p-8 bg-gray-50/30 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">تفاصيل وعناصر الطلب</p>
                    <div className="h-px flex-1 bg-gray-100 mx-4" />
                  </div>
                  
                  {isCart ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {order.cart_items!.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm group-hover:border-primary/20 transition-all hover:shadow-md">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 border border-gray-100">
                              <ShoppingBag size={16} />
                            </div>
                            <div>
                              <p className="font-black text-gray-900 text-sm line-clamp-1">{item.name}</p>
                              {item.size && (
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{item.size}</span>
                                  {item.color && <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{item.color}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="font-black text-primary bg-primary/5 px-3 py-1.5 rounded-xl text-sm border border-primary/10">
                            ×{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-primary/20 transition-all hover:shadow-md">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
                            <Package size={20} />
                         </div>
                        <div>
                          <p className="font-black text-gray-900 text-base">حزمة مطبوعات مخصصة (الطلب السريع)</p>
                          {(order.size || order.color) && (
                            <div className="flex items-center gap-2 mt-1.5">
                              {order.size && <span className="text-[10px] font-black text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">{order.size}</span>}
                              {order.color && <span className="text-[10px] font-black text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100">{order.color}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] text-gray-400 font-black uppercase mb-1">الكمية</span>
                        <span className="font-black text-primary bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 text-base shadow-sm">
                          ×{order.quantity}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
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
        </>
      )}
    </div>
  );
}

// ─── Page wrapper ──────────────────────────────────────────────────────────────
export default function AccountPage() {
  return (
    <main className="min-h-screen bg-gray-50/50 flex flex-col pt-8">
      <Suspense fallback={
        <div className="flex-grow flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      }>
        <AccountContent />
      </Suspense>
    </main>
  );
}
