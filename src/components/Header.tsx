"use client";

import Link from "next/link";
import { Search, Menu, X, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { useSettingsStore } from "@/store/settingsStore";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCartStore();
  const { branding, navigation } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.length;

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4 h-12 md:h-14 flex items-center justify-between gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden w-8 h-8 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Logo - Increased Size */}
        <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
          {branding.logo ? (
            <div className="relative w-24 h-6 sm:w-32 sm:h-8 overflow-hidden flex-shrink-0 hover:scale-[1.02] transition-transform">
              <Image 
                src={branding.logo} 
                alt={branding.storeName} 
                fill 
                priority
                sizes="(max-width: 640px) 96px, 128px"
                className="object-contain object-right" 
              />
            </div>
          ) : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-2xl">
              {branding.storeName.charAt(0)}
            </div>
          )}
          {!branding.logo && (
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-xl lg:text-2xl tracking-tight text-gray-900 leading-tight">
                {branding.storeName}
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-bold text-primary tracking-[0.2em]">
                Premium Services
              </span>
            </div>
          )}
        </Link>

        {/* Dynamic Navigation */}
        <nav className="hidden lg:flex items-center gap-10 text-sm font-bold text-gray-600">
          {navigation && navigation.length > 0 ? (
            navigation.map((item, idx) => (
              <Link 
                key={idx} 
                href={item.href} 
                className="hover:text-primary transition-all relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
              </Link>
            ))
          ) : (
             <>
               <Link href="/products" className="hover:text-primary transition-colors">كل الخدمات</Link>
             </>
          )}
        </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="ابحث هنا..." 
                className="bg-gray-50 border-gray-100 rounded-full py-3 px-11 text-sm focus:ring-4 focus:ring-primary/10 w-44 lg:w-56 transition-all h-11 border"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            {/* Account Icon */}
            <Link 
              href="/account"
              className="w-11 h-11 text-gray-700 hover:bg-gray-50 border border-transparent hover:border-gray-100 rounded-full transition-colors flex items-center justify-center"
              title="حسابي"
            >
              <UserCircle size={24} />
            </Link>
 
            {/* Cart Button - Direct Redirect */}
            <Link 
              href="/checkout"
              className="relative w-8 h-8 bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-full transition-all flex items-center justify-center hover:scale-110 active:scale-95"
            >
              <ShoppingCart size={14} />
              {mounted && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white text-primary text-[8px] font-black flex items-center justify-center rounded-full shadow-md">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-2xl py-8 px-6 flex flex-col gap-6 text-right z-[80]"
          >
            {navigation && navigation.map((item, idx) => (
              <Link key={idx} href={item.href} onClick={() => setIsMenuOpen(false)} className="py-2 text-lg font-bold border-b border-gray-50 text-gray-800">
                {item.label}
              </Link>
            ))}
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="py-2 text-lg font-bold border-b border-gray-50 text-gray-400">الرئيسية</Link>
            <Link href="/account" onClick={() => setIsMenuOpen(false)} className="py-2 text-lg font-bold border-b border-gray-50 text-primary">حسابي الشخصي</Link>
            
            {/* Legal Links for Compliance */}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100">
              <Link href="/privacy" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">سياسة الخصوصية</Link>
              <Link href="/terms" onClick={() => setIsMenuOpen(false)} className="text-sm font-bold text-gray-500 hover:text-primary transition-colors">شروط الاستخدام</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
