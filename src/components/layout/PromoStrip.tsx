"use client";

import { useSettingsStore } from "@/store/settingsStore";
import Link from "next/link";
import { ArrowLeft, Sparkles, PlusCircle } from "lucide-react";

export default function PromoStrip() {
  const { promobar } = useSettingsStore();

  if (!promobar || !promobar.enabled) return null;

  const savedButtons = promobar.buttons;
  const buttons = Array.isArray(savedButtons)
    ? savedButtons
    : [
        { label: "إذا كنت صاحب صيدلية اضغط هنا", link: "/products?category=pharmacy", color: "green", position: "right" },
        { label: "العروض والتخفيضات", link: "/offers", color: "white", position: "left" }
      ];

  const rightButtons = buttons.filter((b: any) => b.position === "right");
  const leftButtons = buttons.filter((b: any) => b.position === "left");

  return (
    <div
      style={{
        animation: "dropIn 300ms ease-out",
        backgroundColor: promobar.bgColor || "#00AEEF",
        backgroundImage: 'linear-gradient(to right, rgba(0,0,0,0.1), transparent, rgba(0,0,0,0.1))'
      }}
      className="w-full border-b border-white/10 shadow-xl overflow-hidden"
    >
      <div className="container mx-auto px-4 py-1.5 flex flex-row items-center justify-between gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
        
        {/* Right Side Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {rightButtons.map((btn: any, idx: number) => (
            <Link 
              key={idx} 
              href={btn.link}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full font-black text-[10px] sm:text-xs transition-all hover:scale-105 active:scale-95 shadow-lg ${
                btn.color === "green" ? "bg-[#25D366] text-white shadow-green-600/20" : 
                btn.color === "white" ? "bg-white text-primary shadow-white/20" :
                "bg-primary text-white"
              }`}
            >
              {btn.label.includes("اضغط هنا") ? (
                <>
                  {btn.label.split("اضغط هنا")[0]}
                  <span
                    style={{ animation: "pulseGlow 2s ease-in-out infinite", color: "#FFE24D" }}
                    className="underline decoration-2 underline-offset-4 font-black mx-1 inline-block"
                  >
                    اضغط هنا
                  </span>
                  {btn.label.split("اضغط هنا")[1]}
                </>
              ) : btn.label}
            </Link>
          ))}
        </div>

        {/* Dynamic Center Text or just space */}
        <div className="hidden lg:flex items-center gap-2 text-white/90 font-bold text-xs">
           <Sparkles size={14} className="text-yellow-300 animate-pulse" />
           <span>استفد من عروض الجملة الحصرية اليوم!</span>
        </div>

        {/* Left Side Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {leftButtons.map((btn: any, idx: number) => (
            <Link 
              key={idx} 
              href={btn.link}
              className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2 rounded-full font-black text-[10px] sm:text-xs transition-all hover:scale-105 active:scale-95 shadow-lg ${
                btn.color === "green" ? "bg-[#25D366] text-white" : 
                btn.color === "white" ? "bg-white text-gray-900 shadow-white/20" :
                "bg-primary text-white border border-white/20"
              }`}
            >
              {btn.label}
              <ArrowLeft size={14} className="sm:size-4" />
            </Link>
          ))}
        </div>

      </div>
      
      {/* Decorative patterns */}
      <div className="absolute top-0 left-0 w-24 h-full bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
    </div>
  );
}
