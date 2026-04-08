"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Eye } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function ProductCard({ id, name, price, image, category }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[2.5rem] p-5 border border-gray-100 shadow-sm hover:shadow-2xl transition-all group relative"
    >
      {/* Badge */}
      <div className="absolute top-8 left-8 z-20 bg-primary/90 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
        جديد
      </div>

      {/* Image Container */}
      <Link href={`/product/${id}`} className="block aspect-[4/5] bg-gray-100 rounded-[2rem] mb-6 overflow-hidden relative">
        <Image
          src={image || "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800"}
          alt={name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
           <div className="p-3 bg-white text-gray-900 rounded-full hover:bg-primary hover:text-white transition-all transform scale-90 group-hover:scale-100">
              <Eye size={20} />
           </div>
        </div>
      </Link>

      {/* Info */}
      <div className="px-2">
        <span className="text-primary font-bold text-xs uppercase tracking-wider mb-2 block">{category}</span>
        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-1 group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl group-hover:bg-primary/5 transition-colors">
           <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">السعر</span>
              <span className="text-2xl font-black text-gray-950">{price} <span className="text-sm font-bold text-primary">د.ج</span></span>
           </div>
           <Link 
             href={`/product/${id}`}
             className="bg-gray-950 text-white rounded-xl px-5 py-3 font-bold hover:bg-primary transition-all flex items-center gap-2 shadow-lg hover:shadow-primary/30"
           >
              <span>اطلب</span>
              <ShoppingCart size={18} />
           </Link>
        </div>
      </div>
    </motion.div>
  );
}
