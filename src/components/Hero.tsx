"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    id: 1,
    title: "أكياس ورقية فخمة لعلامتك التجارية",
    subtitle: "جودة عالية وتصاميم مخصصة تعكس رقي منتجاتك",
    buttonText: "تصفح المنتجات",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=2000",
    color: "bg-primary"
  },
  {
    id: 2,
    title: "حلول تعبئة ذكية وصديقة للبيئة",
    subtitle: "نقدم لك أفضل خامات الأكياس القماشية في الجزائر",
    buttonText: "اطلب الآن",
    image: "https://images.unsplash.com/photo-1598257006458-087169a1f08d?auto=format&fit=crop&q=80&w=2000",
    color: "bg-teal-700"
  }
];

export default function Hero() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);
  const prev = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);

  return (
    <section className="relative h-[600px] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 bg-black/40 z-10" />
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            className="object-cover"
            priority
          />

          {/* Content */}
          <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center items-center text-center text-white">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl font-black mb-6 leading-tight max-w-4xl"
            >
              {slides[current].title}
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl mb-10 text-gray-100 max-w-2xl font-light"
            >
              {slides[current].subtitle}
            </motion.p>
            <Link href="/products">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-full font-bold text-lg shadow-2xl transition-all"
              >
                {slides[current].buttonText}
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between z-30 pointer-events-none">
        <button 
          onClick={prev}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm pointer-events-auto transition-colors"
        >
          <ChevronLeft size={30} />
        </button>
        <button 
          onClick={next}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm pointer-events-auto transition-colors"
        >
          <ChevronRight size={30} />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              i === current ? "bg-primary w-8" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
