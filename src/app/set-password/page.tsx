"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Eye, EyeOff, Lock, Loader2, ShieldCheck, Star } from "lucide-react";

// ── Inner component that uses useSearchParams ─────────────────────────────────
function SetPasswordContent() {
  const params = useSearchParams();
  const router = useRouter();

  const phone   = params.get("phone")   || "";
  const name    = params.get("name")    || "";
  const refId   = params.get("ref")     || "";
  const waLink  = params.get("wa")      || "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [showCfm, setShowCfm]     = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState("");

  // Strength helpers
  const strength = (() => {
    if (password.length === 0) return 0;
    let s = 0;
    if (password.length >= 6) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabel = ["", "ضعيفة", "مقبولة", "جيدة", "قوية"][strength];
  const strengthColor = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-500"][strength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) return setError("كلمة السر يجب أن تكون 6 أحرف على الأقل.");
    if (password !== confirm) return setError("كلمتا السر غير متطابقتين.");

    setIsLoading(true);
    try {
      const res = await fetch("/api/setup-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, name, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل إنشاء الحساب");

      // Save session data so account page can auto-load
      sessionStorage.setItem("servseri_phone", phone);
      sessionStorage.setItem("servseri_name", name);

      router.push(`/account?ref=${refId}&wa=${encodeURIComponent(waLink)}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ، يرجى المحاولة لاحقاً.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 flex flex-col pt-12">

      <div className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">

          {/* Order Confirmed Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-2 border-green-200 rounded-3xl p-6 mb-8 flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
              <CheckCircle2 size={32} className="text-green-600" />
            </div>
            <div>
              <p className="text-green-800 font-black text-lg">
                تم تسجيل طلبك بنجاح! 🎉
              </p>
              <p className="text-green-700 text-sm font-medium mt-0.5">
                رقم المرجع: <span className="font-black">#{refId.toUpperCase()}</span>
              </p>
            </div>
          </motion.div>

          {/* Password Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-gray-100 relative overflow-hidden"
          >
            {/* Background decorations */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Icon + Title */}
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-5 shadow-inner">
                  <ShieldCheck size={32} />
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
                  أنشئ كلمة سر حسابك
                </h1>
                <p className="text-gray-500 font-medium text-sm leading-relaxed max-w-sm">
                  مرحباً <span className="font-black text-primary">{name || "بك"}</span>! أنشئ كلمة سر لحسابك حتى تتمكن من متابعة طلباتك والوصول إلى عروضك الحصرية.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 text-right" dir="rtl">
                {/* Phone display (read-only) */}
                <div className="bg-gray-50 rounded-2xl px-5 py-4 flex items-center gap-3">
                  <ShieldCheck size={16} className="text-primary shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">رقم الهاتف المرتبط بحسابك</p>
                    <p className="font-black text-gray-900 tracking-wider" dir="ltr">{phone}</p>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700 block">كلمة السر الجديدة</label>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      required
                      type={showPwd ? "text" : "password"}
                      placeholder="أدخل كلمة السر (6 أحرف كحد أدنى)"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl py-4 pr-12 pl-12 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                    <button type="button" onClick={() => setShowPwd(v => !v)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Strength indicator */}
                  {password.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColor : "bg-gray-200"}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-bold ${["", "text-red-500", "text-orange-500", "text-yellow-600", "text-green-600"][strength]}`}>
                        قوة كلمة السر: {strengthLabel}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700 block">تأكيد كلمة السر</label>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      required
                      type={showCfm ? "text" : "password"}
                      placeholder="أعد إدخال كلمة السر"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pr-12 pl-12 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all ${
                        confirm.length > 0 && confirm !== password ? "border-red-300 bg-red-50" :
                        confirm.length > 0 && confirm === password ? "border-green-300 bg-green-50" :
                        "border-gray-100"
                      }`}
                    />
                    <button type="button" onClick={() => setShowCfm(v => !v)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors">
                      {showCfm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    {confirm.length > 0 && confirm === password && (
                      <CheckCircle2 size={16} className="absolute left-12 top-1/2 -translate-y-1/2 text-green-500" />
                    )}
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl font-bold text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? (
                    <><Loader2 className="animate-spin" size={22} /> جاري إنشاء حسابك...</>
                  ) : (
                    <><ShieldCheck size={22} /> إنشاء الحساب والمتابعة</>
                  )}
                </button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  {[
                    { icon: ShieldCheck, text: "حساب آمن" },
                    { icon: Star, text: "عروض حصرية" },
                    { icon: Lock, text: "بيانات مشفرة" },
                  ].map(b => (
                    <div key={b.text} className="flex items-center gap-1.5 text-gray-400">
                      <b.icon size={13} />
                      <span className="text-xs font-bold">{b.text}</span>
                    </div>
                  ))}
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}

// ── Page wrapper with Suspense (required because useSearchParams is async) ─────
export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    }>
      <SetPasswordContent />
    </Suspense>
  );
}
