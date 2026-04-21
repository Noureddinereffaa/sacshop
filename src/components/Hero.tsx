"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSettingsStore } from "@/store/settingsStore";

export default function Hero() {
  const { slider, isLoaded } = useSettingsStore();
  const [current, setCurrent] = useState(0);

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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const next = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);
  const prev = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);

  if (!isLoaded) {
    return (
      <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </section>
    );
  }

  return (
    <section className="relative h-[500px] md:h-[600px] w-full overflow-hidden group">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image with Ken Burns Effect */}
          <motion.div 
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 7, ease: "easeOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 z-10" />
            <Image
              src={slides[current].image}
              alt={slides[current].title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </motion.div>

          {/* Content */}
          <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
            <div className="bg-black/20 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl max-w-4xl w-full flex flex-col items-center transform transition-all">
              <motion.h1
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="text-4xl md:text-5xl lg:text-7xl font-black mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 drop-shadow-md"
              >
                {slides[current].title}
              </motion.h1>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                className="text-lg md:text-2xl mb-10 text-gray-200 max-w-2xl font-medium leading-relaxed"
              >
                {slides[current].subtitle}
              </motion.p>
              
              <Link href={slides[current].link || "/products"}>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  whileHover={{ scale: 1.05, boxShadow: "0px 10px 30px -10px rgba(var(--color-primary-rgb), 0.8)" }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-primary hover:bg-primary/95 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-primary/50 transition-all flex items-center gap-2 group"
                >
                  {slides[current].buttonText}
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-2 right-2 md:left-6 md:right-6 flex items-center justify-between z-30 pointer-events-none">
        <button 
          onClick={next} // RTL logical next would be right arrow technically, but visual next is left arrow in LTR. In RTL usually left arrow is "next" or "forward" and right is "past". Let's stick with visually logical meaning. If right passes to previous:
          className="p-3 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md pointer-events-auto transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
          aria-label="السابق"
        >
          <ChevronRight size={28} />
        </button>
        <button 
          onClick={prev} // Visual left arrow
          className="p-3 rounded-full bg-white/10 hover:bg-white/30 text-white backdrop-blur-md pointer-events-auto transition-all opacity-0 group-hover:opacity-100 transform hover:scale-110"
          aria-label="التالي"
        >
          <ChevronLeft size={28} />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2.5 rounded-full transition-all duration-300 ease-in-out ${
              i === current ? "bg-primary w-10 shadow-[0_0_10px_rgba(var(--color-primary-rgb),0.8)]" : "bg-white/50 w-2.5 hover:bg-white"
            }`}
            aria-label={`شريحة ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
