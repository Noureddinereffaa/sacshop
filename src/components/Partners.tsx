"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";
import { useSettingsStore } from "@/store/settingsStore";

export default function Partners() {
  const { partners: storePartners } = useSettingsStore();

  const defaultPartners = [
    { name: "Cebita", logo: "/partners/cebita.png" },
    { name: "Mostawdaa", logo: "/partners/mostawdaa.png" },
    { name: "DzBag", logo: "/partners/dzbag.png" },
    { name: "AlgerBox", logo: "/partners/algerbox.png" },
    { name: "EcoPack", logo: "/partners/ecopack.png" },
    { name: "SmartBag", logo: "/partners/smartbag.png" }
  ];

  const partners = storePartners && storePartners.length > 0 ? storePartners : defaultPartners;
  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 mb-12 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">شركاء النجاح</h2>
        <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
      </div>

      <div className="relative flex overflow-x-hidden">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: 25,
              ease: "linear",
            },
          }}
          className="flex whitespace-nowrap gap-12 items-center px-12"
        >
          {[...partners, ...partners].map((partner, index) => (
            <div 
              key={index} 
              className="w-44 h-28 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all hover:scale-105 hover:shadow-md cursor-pointer"
            >
              {partner.logo ? (
                 <img 
                   src={partner.logo} 
                   alt={partner.name} 
                   className="max-h-full max-w-full object-contain pointer-events-none"
                 />
              ) : (
                <div className="flex flex-col items-center gap-2 opacity-60">
                   <ImageIcon size={32} className="text-gray-400" />
                   <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">{partner.name}</span>
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
