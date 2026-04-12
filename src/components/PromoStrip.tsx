"use client";

import { useSettingsStore } from "@/store/settingsStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Sparkles, PlusCircle } from "lucide-react";

export default function PromoStrip() {
  const { promobar } = useSettingsStore();

  if (!promobar || !promobar.enabled) return null;

  const buttons = promobar.buttons || [
    { label: "إذا كنت صاحب صيدلية اضغط هنا", link: "/products?category=pharmacy", color: "green", position: "right" },
    { label: "العروض والتخفيضات", link: "/offers", color: "white", position: "left" }
  ];

  const rightButtons = buttons.filter((b: any) => b.position === "right");
  const leftButtons = buttons.filter((b: any) => b.position === "left");

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full relative z-40 border-b border-white/10 shadow-xl overflow-hidden"
      style={{ 
        backgroundColor: promobar.bgColor || "#00AEEF",
        backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.1), transparent, rgba(0,0,0,0.1))'
      }}
    >
      <div className="container mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Right Side Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
          {rightButtons.map((btn: any, idx: number) => (
            <Link 
              key={idx} 
              href={btn.link}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-lg ${
                btn.color === "green" ? "bg-[#25D366] text-white shadow-green-600/20" : 
                btn.color === "white" ? "bg-white text-primary shadow-white/20" :
                "bg-primary text-white"
              }`}
            >
              {btn.label === "إذا كنت صاحب صيدلية اضغط هنا" && <PlusCircle size={16} />}
              {btn.label}
            </Link>
          ))}
        </div>

        {/* Dynamic Center Text or just space */}
        <div className="hidden lg:flex items-center gap-2 text-white/90 font-bold text-xs">
           <Sparkles size={14} className="text-yellow-300 animate-pulse" />
           <span>استفد من عروض الجملة الحصرية اليوم!</span>
        </div>

        {/* Left Side Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
          {leftButtons.map((btn: any, idx: number) => (
            <Link 
              key={idx} 
              href={btn.link}
              className={`flex items-center gap-2 px-5 py-2 rounded-full font-black text-sm transition-all hover:scale-105 active:scale-95 shadow-lg ${
                btn.color === "green" ? "bg-[#25D366] text-white" : 
                btn.color === "white" ? "bg-white text-gray-900 shadow-white/20" :
                "bg-primary text-white border border-white/20"
              }`}
            >
              {btn.label}
              <ArrowLeft size={16} />
            </Link>
          ))}
        </div>

      </div>
      
      {/* Decorative patterns */}
      <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
    </motion.div>
  );
}
