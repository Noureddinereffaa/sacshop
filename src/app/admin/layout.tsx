"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, Package,
  Settings, Users, Crown, LogOut, ChevronLeft
} from "lucide-react";

const NAV_LINKS = [
  { href: "/admin", label: "لوحة المعلومات", icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { href: "/admin/products", label: "المنتجات", icon: Package },
  { href: "/admin/offers", label: "العروض الحصرية", icon: Crown },
  { href: "/admin/customers", label: "الزبائن", icon: Users },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-72 bg-gray-950 text-white fixed right-0 top-0 h-full flex flex-col z-40 shadow-2xl">
        {/* Logo */}
        <div className="p-8 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black text-xl group-hover:scale-110 transition-transform">
              S
            </div>
            <div>
              <p className="font-black text-lg tracking-tight">SacShop</p>
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

      {/* Main Content */}
      <div className="flex-1 mr-72">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm">
              A
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm leading-none">المشرف</p>
              <p className="text-gray-400 text-xs">admin@sacshop.dz</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm hidden md:block">
            {new Date().toLocaleDateString("ar-DZ", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </header>

        {/* Page Content */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
