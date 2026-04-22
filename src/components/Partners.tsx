"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, Users2 } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";

const PartnerCard = ({ partner }: { partner: { name: string; logo: string } }) => (
  <div className="group relative flex-shrink-0 w-44 h-28 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-primary/30 hover:scale-105">
    {/* Hover glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary/6 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-400" />
    {partner.logo ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={partner.logo}
        alt={partner.name}
        className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500 pointer-events-none"
      />
    ) : (
      <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-70 transition-opacity">
        <ImageIcon size={28} className="text-gray-400 group-hover:text-primary transition-colors duration-300" />
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 text-center leading-tight">
          {partner.name}
        </span>
      </div>
    )}
  </div>
);

export default function Partners() {
  const { partners: storePartners } = useSettingsStore();

  const defaultPartners = [
    { name: "Cebita", logo: "" },
    { name: "Mostawdaa", logo: "" },
    { name: "DzBag", logo: "" },
    { name: "AlgerBox", logo: "" },
    { name: "EcoPack", logo: "" },
    { name: "SmartBag", logo: "" },
  ];

  const partners = storePartners && storePartners.length > 0 ? storePartners : defaultPartners;
  const useStaticGrid = partners.length <= 4;

  // ── Infinite Marquee maths ──────────────────────────────────────────────────
  // Card width (176px) + gap (24px) = 200px per slot.
  // To guarantee the track fills a 2560px screen with NO gaps:
  //   min cards per half = ceil(2560 / 200) = 13
  //   sets of partners per half = ceil(13 / partners.length)
  // We keep TWO identical halves → animation moves -50% = exactly one half.
  const setsPerHalf = Math.max(2, Math.ceil(13 / partners.length));
  const half = Array.from({ length: setsPerHalf }, () => partners).flat();
  // Track = half + half (identical) so -50% snaps perfectly to start
  const track = [...half, ...half];

  // Duration scales with the number of unique partners (4 s per partner)
  const duration = Math.max(14, partners.length * 4);

  return (
    <section className="py-16 bg-white overflow-hidden relative">
      {/* Edge rules */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* Keyframe — injected once, no styled-jsx needed */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes partnerMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .partner-track {
          animation: partnerMarquee ${duration}s linear infinite;
          will-change: transform;
        }
        .partner-track:hover { animation-play-state: paused; }
      ` }} />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 mb-12 text-center relative z-10"
      >
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
          <Users2 size={14} />
          <span>شركاء النجاح</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
          يثقون بنا{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary to-primary/70">
            {partners.length}+ علامة تجارية
          </span>
        </h2>
        <p className="text-gray-500 font-medium max-w-lg mx-auto text-sm">
          نفخر بشراكتنا مع أفضل العلامات التجارية في الجزائر لتقديم أعلى معايير الجودة
        </p>
      </motion.div>

      {useStaticGrid ? (
        /* ── Static grid for ≤4 partners ── */
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-6 justify-center">
            {partners.map((partner, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <PartnerCard partner={partner} />
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        /* ── Infinite seamless marquee for 5+ partners ── */
        <div className="relative">
          {/*
            Thin fade masks — only 60px so logos are visible almost to the edge.
            We use pointer-events:none so hover-pause still works on cards.
          */}
          <div className="absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          {/* Outer clip */}
          <div className="overflow-hidden">
            {/* Track: two identical halves — animation moves -50% = seamless loop */}
            <div className="partner-track flex gap-6 items-center py-4 px-6">
              {track.map((partner, index) => (
                <PartnerCard key={`${index}-${partner.name}`} partner={partner} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
