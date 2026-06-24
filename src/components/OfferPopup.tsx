"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";
import { usePathname } from "next/navigation";
import Link from "next/link";

// Pages where popup is allowed
const ALLOWED_PATHS = ["/", "/products", "/offers"];
const ALLOWED_PREFIXES = ["/products/"];

function shouldShowPopup(pathname: string): boolean {
  // Never show on admin pages
  if (pathname.startsWith("/admin")) return false;
  // Never show on API routes
  if (pathname.startsWith("/api")) return false;
  // Never show on go/ pages
  if (pathname.startsWith("/go")) return false;
  // Check exact matches
  if (ALLOWED_PATHS.includes(pathname)) return true;
  // Check prefix matches (product detail pages)
  if (ALLOWED_PREFIXES.some(p => pathname.startsWith(p))) return true;
  return false;
}

export default function OfferPopup() {
  const { popup, isLoaded } = useSettingsStore();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded || !popup?.enabled) return;
    if (!shouldShowPopup(pathname)) return;

    // Check if shown in this browser (localStorage = once per visitor, not per session)
    const shown = localStorage.getItem("servseri_popup_shown_v2");
    if (shown) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem("servseri_popup_shown_v2", Date.now().toString());
    }, popup.delay || 2000);

    return () => clearTimeout(timer);
  }, [isLoaded, popup, pathname]);

  const closePopup = () => setIsOpen(false);

  if (!popup?.enabled) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm sm:max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col text-right"
            dir="rtl"
          >
            <button
              onClick={closePopup}
              className="absolute top-4 left-4 z-20 p-2 bg-white/80 backdrop-blur-md hover:bg-white rounded-full text-gray-400 hover:text-gray-900 transition-all shadow-sm"
            >
              <X size={20} />
            </button>

            {popup.image ? (
              <div className="relative w-full bg-gray-50 flex justify-center items-center overflow-hidden">
                <img
                  src={popup.image}
                  alt={popup.title || "عرض خاص"}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                 <Sparkles size={48} className="text-primary/20 mb-4 animate-pulse" />
                 <span className="text-lg font-black text-gray-400">لا توجد صورة للعرض</span>
              </div>
            )}

            <div className="p-4 sm:p-6 bg-white w-full flex flex-col gap-3 z-10">
              <Link
                href={popup.buttonLink || "/products"}
                onClick={() => {
                  localStorage.setItem("servseri_popup_clicked", "true");
                  closePopup();
                }}
                className="w-full"
              >
                <button className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group transition-all">
                  <span>{popup.buttonText || "اطلب الآن"}</span>
                  <ArrowRight size={20} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
                </button>
              </Link>
              
              <button 
                onClick={closePopup}
                className="mt-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors w-full text-center"
              >
                ربما لاحقاً
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
