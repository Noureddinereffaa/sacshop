"use client";

import Link from "next/link";
import { Search, Menu, X } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FastRegistrationModal from "./FastRegistrationModal";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl">
            S
          </div>
          <span className="hidden sm:block font-bold text-xl tracking-tight text-gray-900">
            SacShop <span className="text-primary">.dz</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
          <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <Link href="/products" className="hover:text-primary transition-colors">المنتجات</Link>
          <Link href="/track" className="hover:text-primary transition-colors">تتبع الطلب</Link>
          <Link href="/about" className="hover:text-primary transition-colors">من نحن</Link>
        </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="بحث عن منتج..." 
                className="bg-gray-100 border-none rounded-full py-2 px-10 text-sm focus:ring-2 focus:ring-primary/20 w-48 lg:w-64 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            {/* Fast VIP Registration */}
            <FastRegistrationModal />
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
            <Link href="/products" onClick={() => setIsMenuOpen(false)} className="py-2 text-lg font-medium border-b border-gray-50">المنتجات</Link>
            <Link href="/track" onClick={() => setIsMenuOpen(false)} className="py-2 text-lg font-medium border-b border-gray-50">تتبع الطلب</Link>
            <Link href="/about" onClick={() => setIsMenuOpen(false)} className="py-2 text-lg font-medium border-b border-gray-50">من نحن</Link>
            <div className="mt-4 flex flex-col gap-3">
               <FastRegistrationModal />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
