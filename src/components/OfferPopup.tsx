"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import Link from "next/link";
import Image from "next/image";

export default function OfferPopup() {
  const { popup, isLoaded } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    if (!isLoaded || !popup?.enabled) return;

    // Check if shown in this session
    const sessionShown = sessionStorage.getItem("servseri_popup_shown");
    if (sessionShown) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasShown(true);
      sessionStorage.setItem("servseri_popup_shown", "true");
    }, popup.delay || 2000);

    return () => clearTimeout(timer);
  }, [isLoaded, popup]);

  const closePopup = () => setIsOpen(false);

  if (!popup?.enabled) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row text-right"
            dir="rtl"
          >
            {/* Close Button */}
            <button
              onClick={closePopup}
              className="absolute top-4 left-4 z-20 p-2 bg-white/80 backdrop-blur-md hover:bg-white rounded-full text-gray-400 hover:text-gray-900 transition-all shadow-sm"
            >
              <X size={20} />
            </button>

            {/* Content Section */}
            <div className={`flex-1 p-8 sm:p-10 flex flex-col justify-center ${popup.image ? 'md:w-1/2' : 'w-full text-center items-center'}`}>
              <div className={`flex items-center gap-2 text-primary mb-4 ${!popup.image && 'justify-center'}`}>
                <Sparkles size={18} className="animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest">عرض حصري</span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4 leading-tight">
                {popup.title}
              </h2>
              
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed mb-8 font-medium">
                {popup.description}
              </p>

              <Link href={popup.buttonLink || "/products"} onClick={closePopup}>
                <button className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group transition-all">
                  <span>{popup.buttonText || "اطلب الآن"}</span>
                  <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                </button>
              </Link>
              
              <button 
                onClick={closePopup}
                className="mt-4 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors"
              >
                ربما لاحقاً
              </button>
            </div>

            {/* Image Section (Optional) */}
            {popup.image && (
              <div className="relative hidden md:block md:w-1/2 min-h-[400px]">
                <Image
                  src={popup.image}
                  alt={popup.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-transparent to-transparent" />
              </div>
            )}
            
            {/* Mobile Image (Small) */}
            {popup.image && (
              <div className="relative md:hidden h-48 w-full order-first">
                <Image
                  src={popup.image}
                  alt={popup.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
