"use client";

import { motion } from "framer-motion";
import { Image as ImageIcon } from "lucide-react";

const partners = [
  { name: "Cebita", logo: "/partners/cebita.png" },
  { name: "Mostawdaa", logo: "/partners/mostawdaa.png" },
  { name: "DzBag", logo: "/partners/dzbag.png" },
  { name: "AlgerBox", logo: "/partners/algerbox.png" },
  { name: "EcoPack", logo: "/partners/ecopack.png" },
  { name: "SmartBag", logo: "/partners/smartbag.png" }
];

export default function Partners() {
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
              className="w-40 h-24 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center p-6 grayscale hover:grayscale-0 transition-all hover:scale-105 hover:shadow-md cursor-pointer"
            >
              {/* Using a placeholder-like div since I don't have actual logos yet */}
              <div className="flex flex-col items-center gap-2 opacity-60">
                 <ImageIcon size={32} className="text-gray-400" />
                 <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{partner.name}</span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
