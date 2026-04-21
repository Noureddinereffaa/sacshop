"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon, Users2 } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";

const PartnerCard = ({ partner }: { partner: { name: string; logo: string } }) => (
  <div className="group relative flex-shrink-0 w-40 h-24 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center p-5 cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-primary/20 hover:scale-105">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
    {partner.logo ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={partner.logo}
        alt={partner.name}
        className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300 pointer-events-none"
      />
    ) : (
      <div className="flex flex-col items-center gap-2 opacity-50 group-hover:opacity-80 transition-opacity">
        <ImageIcon size={28} className="text-gray-400 group-hover:text-primary transition-colors" />
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{partner.name}</span>
      </div>
    )}
  </div>
);

export default function Partners() {
  const { partners: storePartners } = useSettingsStore();

  const defaultPartners = [
    { name: "Cebita", logo: "/partners/cebita.png" },
    { name: "Mostawdaa", logo: "/partners/mostawdaa.png" },
    { name: "DzBag", logo: "/partners/dzbag.png" },
    { name: "AlgerBox", logo: "/partners/algerbox.png" },
    { name: "EcoPack", logo: "/partners/ecopack.png" },
    { name: "SmartBag", logo: "/partners/smartbag.png" },
  ];

  const partners = storePartners && storePartners.length > 0 ? storePartners : defaultPartners;

  // ≤4 partners → static centered grid; more → infinite scroll marquee
  const useStaticGrid = partners.length <= 4;

  // Repeat list enough times to fill any screen width and loop seamlessly
  const repeatCount = Math.max(2, Math.ceil(12 / partners.length));
  const scrollItems = Array.from({ length: repeatCount }, () => partners).flat();

  // Speed: 5 s per partner slot (feels pleasantly slow)
  const duration = partners.length * 5;

  return (
    <section className="py-16 bg-white overflow-hidden relative">
      {/* Edge dividers */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

      {/* CSS keyframe injected inline — no styled-jsx required */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes partnerMarquee {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
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
        /* ── Infinite marquee for 5+ partners ── */
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

          <div className="flex overflow-hidden">
            <div
              className="flex gap-6 items-center px-6 py-3"
              style={{
                animation: `partnerMarquee ${duration}s linear infinite`,
                willChange: "transform",
              }}
            >
              {scrollItems.map((partner, index) => (
                <PartnerCard key={index} partner={partner} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
