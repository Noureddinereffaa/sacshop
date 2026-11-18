"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";
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
        <div
          key={current}
          style={{ animation: "fadeIn 700ms ease-in-out" }}
          className="absolute inset-0"
        >
          {/* Image with subtle Ken Burns zoom */}
          <div
            className="absolute inset-0"
            style={{ animation: "kenBurns 7s ease-out both" }}
          >
            <OptimizedImage
              src={slides[current].image}
              alt={slides[current].title}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
          </div>

          {/* ── Bottom gradient — keeps image bright, just darkens the very bottom for text legibility ── */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

          {/* ── Text block — anchored to the bottom-right (RTL) ── */}
          <div className="absolute bottom-0 inset-x-0 z-20 px-6 md:px-14 pb-20 md:pb-24">
            <div className="max-w-2xl ml-auto text-right">

              {/* Tag badge */}
              <p
                key={`tag-${current}`}
                style={{ animation: "fadeIn 450ms ease-out 50ms backwards" }}
                className="inline-block bg-primary/80 backdrop-blur-sm text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-5"
              >
                منتجاتنا المميزة
              </p>

              {/* Main heading — layered text-shadow for crisp readability on any photo */}
              <h1
                key={`h1-${current}`}
                style={{
                  animation: "fadeUp 550ms ease-out 180ms backwards",
                  textShadow: "0 2px 4px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.25)"
                }}
                className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4"
              >
                {slides[current].title}
              </h1>

              {/* Accent line + subtitle */}
              <div
                key={`sub-${current}`}
                style={{ animation: "fadeUp 500ms ease-out 320ms backwards" }}
                className="flex items-start justify-end gap-3 mb-8"
              >
                <p
                  className="text-base md:text-lg text-white/90 font-medium leading-relaxed"
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6), 0 2px 20px rgba(0,0,0,0.4)" }}
                >
                  {slides[current].subtitle}
                </p>
                {/* Decorative vertical accent bar */}
                <div className="w-1 shrink-0 rounded-full bg-primary mt-1" style={{ height: "100%", minHeight: "2.5rem" }} />
              </div>

              {/* CTA button — single */}
              <div
                key={`btn-${current}`}
                style={{ animation: "fadeUp 400ms ease-out 480ms backwards" }}
                className="flex items-center justify-end"
              >
                <Link href={slides[current].link || "/products"}>
                  <button
                    className="flex items-center gap-2.5 bg-primary text-white px-8 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-black/30 hover:bg-primary/90 hover:scale-105 hover:-translate-x-1 active:scale-95 transition-all duration-200"
                  >
                    {slides[current].buttonText}
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </Link>
              </div>

            </div>
          </div>
        </div>

      {/* ── Progress bar ── */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-30">
        <div
          key={`prog-${current}`}
          className="h-full bg-primary"
          style={{ animation: "growW 6s linear forwards", animationPlayState: isHovered ? "paused" : "running" }}
        />
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
