"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, PackagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuickAddStore } from "@/store/quickAddStore";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { id, name, price, image_url: image, category } = product;
  const { open } = useQuickAddStore();
  const router = useRouter();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    open(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white rounded-[2.5rem] p-5 border border-gray-100 shadow-sm hover:shadow-2xl transition-all group relative"
    >
      {/* Dynamic Badge */}
      {(() => {
        const isNew = product.created_at && (Date.now() - new Date(product.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000;
        const isFeatured = product.is_featured;
        if (isNew) return (
          <div className="absolute top-8 left-8 z-20 bg-primary/90 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">جديد</div>
        );
        if (isFeatured) return (
          <div className="absolute top-8 left-8 z-20 bg-amber-500/90 backdrop-blur-md text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">⭐ مميز</div>
        );
        return null;
      })()}

      {/* Image Container */}
      <Link href={`/products/${id}`} className="block aspect-[4/5] bg-gray-100 rounded-[2rem] mb-6 overflow-hidden relative">
        <Image
          src={image || "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800"}
          alt={name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
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
        
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-2xl group-hover:bg-primary/5 transition-colors">
           <div className="flex flex-col">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">السعر</span>
              <span className="text-xl font-black text-gray-950">{price} <span className="text-sm font-bold text-primary">د.ج</span></span>
           </div>
           
           <div className="flex gap-2">
             <Link 
               href={`/products/${id}`}
               className="bg-white border-2 border-gray-100 text-gray-600 rounded-xl px-4 flex items-center justify-center hover:border-gray-300 hover:text-gray-900 transition-all shadow-sm"
               title="التفاصيل"
             >
                <Eye size={18} />
             </Link>
             <button 
               onClick={handleAddToCart}
               className="bg-primary text-white rounded-xl w-10 h-10 flex items-center justify-center font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
               title="أضف للسلة للخصم"
             >
                <ShoppingCart size={18} />
             </button>
           </div>
        </div>
      </div>
    </motion.div>
  );
}
