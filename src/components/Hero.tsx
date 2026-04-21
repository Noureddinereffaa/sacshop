"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSettingsStore } from "@/store/settingsStore";

export default function Hero() {
  const { slider, isLoaded } = useSettingsStore();
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const defaultSlides = [
    {
      id: 1,
      title: "أكياس ورقية فخمة لعلامتك التجارية",
      subtitle: "جودة عالية وتصاميم مخصصة تعكس رقي منتجاتك",
      buttonText: "تصفح المنتجات",
      image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=2000",
      link: "/products"
    },
    {
      id: 2,
      title: "حلول تعبئة ذكية وصديقة للبيئة",
      subtitle: "نقدم لك أفضل خامات الأكياس القماشية في الجزائر",
      buttonText: "اطلب الآن",
      image: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=2000",
      link: "/products"
    }
  ];

  const slides = slider && slider.length > 0 ? slider : defaultSlides;

  const next = useCallback(() =>
    setCurrent(c => (c === slides.length - 1 ? 0 : c + 1)), [slides.length]);
  const prev = useCallback(() =>
    setCurrent(c => (c === 0 ? slides.length - 1 : c - 1)), [slides.length]);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next, isHovered]);

  if (!isLoaded) {
    return (
      <section className="relative h-[560px] md:h-[680px] w-full bg-gray-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </section>
    );
  }

  return (
    <section
      className="relative h-[560px] md:h-[680px] w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Slides ── */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Image with subtle Ken Burns zoom */}
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 7, ease: "easeOut" }}
          >
            <Image
              src={slides[current].image}
              alt={slides[current].title}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
          </motion.div>

          {/* ── Bottom gradient — keeps image bright, just darkens the very bottom for text legibility ── */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

          {/* ── Text block — anchored to the bottom-right (RTL) ── */}
          <div className="absolute bottom-0 inset-x-0 z-20 px-6 md:px-12 pb-20 md:pb-24">
            <div className="max-w-2xl ml-auto text-right">
              <motion.p
                key={`tag-${current}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-block bg-primary/80 backdrop-blur-sm text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-4"
              >
                منتجاتنا المميزة
              </motion.p>

              <motion.h1
                key={`h1-${current}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.55 }}
                className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 drop-shadow-lg"
              >
                {slides[current].title}
              </motion.h1>

              <motion.p
                key={`sub-${current}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="text-base md:text-xl text-white/85 font-medium mb-8 leading-relaxed"
              >
                {slides[current].subtitle}
              </motion.p>

              <motion.div
                key={`btn-${current}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="flex items-center justify-end gap-4"
              >
                <Link href={slides[current].link || "/products"}>
                  <motion.button
                    whileHover={{ scale: 1.04, x: -4 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-primary/40 hover:bg-primary/90 transition-colors"
                  >
                    {slides[current].buttonText}
                    <ArrowLeft className="w-5 h-5" />
                  </motion.button>
                </Link>
                <Link href="/products">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-bold text-base border border-white/30 hover:bg-white/25 transition-colors"
                  >
                    كل المنتجات
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-30">
        <motion.div
          key={`prog-${current}`}
          className="h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{ width: isHovered ? undefined : "100%" }}
          transition={{ duration: 6, ease: "linear" }}
        />
      </div>

      {/* ── Arrow Navigation ── */}
      <div className="absolute inset-y-0 left-3 right-3 md:left-5 md:right-5 flex items-center justify-between z-30 pointer-events-none">
        <button
          onClick={prev}
          className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 transition-all pointer-events-auto hover:scale-110 active:scale-95"
          aria-label="السابق"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={next}
          className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 transition-all pointer-events-auto hover:scale-110 active:scale-95"
          aria-label="التالي"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* ── Dots ── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`شريحة ${i + 1}`}
            className={`rounded-full transition-all duration-400 ${
              i === current
                ? "bg-primary w-8 h-2.5 shadow-[0_0_12px_rgba(var(--color-primary-rgb),0.9)]"
                : "bg-white/40 hover:bg-white/70 w-2.5 h-2.5"
            }`}
          />
        ))}
      </div>

      {/* ── Slide counter ── */}
      <div className="absolute top-5 left-5 z-30 flex items-center gap-1.5 text-white/70 text-xs font-black tabular-nums">
        <span className="text-white text-sm">{String(current + 1).padStart(2, "0")}</span>
        <span>/</span>
        <span>{String(slides.length).padStart(2, "0")}</span>
      </div>
    </section>
  );
}
