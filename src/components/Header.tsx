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
  const { branding } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden w-11 h-11 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          {branding.logo ? (
            <div className="relative w-10 h-10 overflow-hidden rounded-xl">
              <Image src={branding.logo} alt={branding.storeName} fill className="object-contain" />
            </div>
          ) : (
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
              {branding.storeName.charAt(0)}
            </div>
          )}
          <span className="hidden sm:block font-bold text-xl tracking-tight text-gray-900">
            {branding.storeName} <span className="text-primary font-black">.</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <Link href="/products" className="hover:text-primary transition-colors">المطبوعات</Link>
          <Link href="/about" className="hover:text-primary transition-colors">من نحن</Link>
        </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="بحث عن منتج..." 
                className="bg-gray-100 border-none rounded-full py-3 px-11 text-sm focus:ring-2 focus:ring-primary/20 w-48 lg:w-64 transition-all h-11"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            {/* Account Icon */}
            <Link 
              href="/account"
              className="w-11 h-11 text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center -ml-1 sm:ml-0"
              title="حسابي"
            >
              <UserCircle size={24} />
            </Link>
 
            {/* Cart Button - Direct Redirect */}
            <Link 
              href="/checkout"
              className="relative w-11 h-11 text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
            >
              <ShoppingCart size={24} />
              {mounted && totalItems > 0 && (
                <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
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
            className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl py-6 px-4 flex flex-col gap-4 text-right"
          >
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="py-2 text-lg font-medium border-b border-gray-50">الرئيسية</Link>
            <Link href="/products" onClick={() => setIsMenuOpen(false)} className="py-2 text-lg font-medium border-b border-gray-50">المطبوعات</Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)} className="py-2 text-lg font-medium border-b border-gray-50">من نحن</Link>
            <Link href="/account" onClick={() => setIsMenuOpen(false)} className="py-2 text-lg font-medium border-b border-gray-50 text-primary font-bold">بوابة العميل</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
