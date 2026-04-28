"use client";

import { useState, useEffect } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettingsStore } from "@/store/settingsStore";
import {
  LayoutDashboard, ShoppingBag, Package,
  Settings, Users, Crown, LogOut, ChevronLeft, Menu, X, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_LINKS = [
  { href: "/admin", label: "لوحة المعلومات", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/offers", label: "العروض الحصرية", icon: Crown },
  { href: "/admin/customers", label: "الزبائن", icon: Users },
  { href: "/admin/analytics", label: "التقارير والإحصائيات", icon: BarChart3 },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { branding } = useSettingsStore();

  useEffect(() => {
    // Verify session via secure server-side API (httpOnly cookie)
    async function checkSession() {
      try {
        const res = await fetch("/api/admin-auth");
        const data = await res.json();
        setIsAuthenticated(data.authenticated === true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsChecking(false);
      }
    }
    checkSession();
  }, []);

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError("");
    try {
      const res = await fetch("/api/admin-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
      } else {
        setError(data.error || "كلمة المرور غير صحيحة");
      }
    } catch {
      setError("خطأ في الاتصال بالخادم");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isChecking) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-right" dir="rtl">
        <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-sm">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center font-black text-3xl text-white mb-6 mx-auto">
            S
          </div>
          <h2 className="text-2xl font-black text-gray-900 text-center mb-2">تسجيل الدخول للإدارة</h2>
          <p className="text-gray-500 text-sm text-center mb-8 font-bold">يرجى إدخال كلمة المرور للوصول إلى لوحة التحكم</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="كلمة المرور..."
                dir="ltr"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 focus:ring-2 focus:ring-primary/20 outline-none text-center font-black tracking-widest"
              />
              {error && <p className="text-red-500 text-xs font-bold mt-2 text-center">{error}</p>}
            </div>
            <button type="submit" disabled={isLoggingIn} className="w-full bg-primary text-white py-4 rounded-xl font-black text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60">
              {isLoggingIn ? "جاري التحقق..." : "الدخول للوحة التحكم"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 bg-gray-950 text-white relative min-h-screen flex-col z-40 shadow-2xl">
        {/* Logo */}
        <div className="p-8 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
              S
            </div>
            <div>
              <p className="font-black text-lg tracking-tight">{branding?.storeName || "Service Serigraphie"}</p>
              <p className="text-gray-500 text-xs font-bold">لوحة التحكم</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_LINKS.map(link => {
            const active = isActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all group ${
                  active
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <link.icon size={20} className={active ? "text-white" : "text-gray-500 group-hover:text-primary"} />
                <span>{link.label}</span>
                {active && <ChevronLeft size={16} className="mr-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all font-bold"
          >
            <LogOut size={18} />
            <span>عرض المتجر</span>
          </Link>
        </div>
      </aside>

      {/* Sidebar - Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="w-72 bg-gray-950 text-white fixed right-0 top-0 h-full flex flex-col z-50 shadow-2xl lg:hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-xl">S</div>
                  <div>
                    <p className="font-black text-lg tracking-tight">{branding?.storeName || "Service Serigraphie"}</p>
                    <p className="text-gray-500 text-xs font-bold">لوحة التحكم</p>
                  </div>
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
                {NAV_LINKS.map(link => {
                  const active = isActive(link.href, link.exact);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all group ${
                        active ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <link.icon size={20} className={active ? "text-white" : "text-gray-500"} />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-full overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-4 lg:px-8 relative z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 -mr-2 hover:bg-gray-100 rounded-full text-gray-700 transition"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm">
              A
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm leading-none">المشرف</p>
              <p className="text-gray-400 text-xs">admin@serigraphie.dz</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm hidden md:block">
            {new Date().toLocaleDateString("ar-DZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
