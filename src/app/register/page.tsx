"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, Lock, User, Eye, EyeOff, Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const dzPhoneRegex = /^(05|06|07)[0-9]{8}$/;
      if (!dzPhoneRegex.test(phone.trim())) {
         throw new Error("يرجى إدخال رقم هاتف جزائري صحيح (05/06/07XXXXXXXX)");
      }
      
      const res = await fetch("/api/register-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "خطأ في التسجيل");

      // Auto login after registration
      sessionStorage.setItem("servseri_phone", phone);
      router.push("/account");

    } catch (e: any) {
      setError(e.message || "حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-transparent pt-12">
      
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col items-center text-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-5">
              <User size={30} />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-2">إنشاء حساب جديد</h1>
            <p className="text-gray-500 text-sm font-medium">سجل بياناتك كمشتري جملة لمتابعة طلباتك بفعالية</p>
          </div>

          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-5 font-bold text-sm relative z-10">{error}</div>}

          <form onSubmit={handleRegister} className="space-y-4 text-right relative z-10" dir="rtl">
            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input required type="text" placeholder="الاسم أو اسم المطبعة"
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

            <div className="space-y-2">
              <label className="text-sm font-black text-gray-700">كلمة السر</label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
                <input required type={showPwd ? "text" : "password"} placeholder="اختر كلمة سر قوية"
                  value={password} onChange={e => setPassword(e.target.value)}
                  minLength={6}
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-12 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading}
              className="w-full mt-2 bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60">
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : null}
              {isLoading ? "جاري الإنشاء..." : "إنشاء الحساب"}
            </button>
          </form>

          <div className="mt-8 text-center relative z-10">
             <Link href="/account" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors">
                <span>لديك حساب بالفعل؟ تسجيل الدخول</span>
                <ArrowRight size={14} className="rotate-180" />
             </Link>
          </div>

          <div className="absolute bottom-4 left-4 opacity-[0.03] pointer-events-none">
            <ShieldCheck size={120} />
          </div>
        </div>
      </div>
      
    </main>
  );
}
