"use client";

import { useQuickAddStore } from "@/store/quickAddStore";
import { useCartStore } from "@/store/cartStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Star, CheckCircle2, Package } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useMemo, useEffect } from "react";

export default function QuickAddModal() {
  const pathname = usePathname();
  const { isOpen, product, close } = useQuickAddStore();
  const { addItem, setCustomerStatus } = useCartStore();
  const router = useRouter();

  if (pathname?.startsWith("/admin")) return null;

  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(200);
  const [numColors, setNumColors] = useState(1);
  const [isDoubleSided, setIsDoubleSided] = useState(false);
  const [customVariantSelections, setCustomVariantSelections] = useState<Record<string, string>>({});

  // Reset states when product changes
  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      } else {
        setSelectedSize("");
      }
      setSelectedColor("");
      setNumColors(1);
      setIsDoubleSided(false);
      setCustomVariantSelections({});
      
      let initialTiers = product.quantity_tiers;
      if (initialTiers && initialTiers.length > 0) {
         if (initialTiers[0]?.tiers) {
           initialTiers = initialTiers[0].tiers;
         }
         if (initialTiers && initialTiers.length > 0) {
           setQuantity(initialTiers[0].min_qty);
         }
      } else {
        setQuantity(100);
      }
    }
  }, [product]);

  const activeTiers = useMemo(() => {
    if (!product || !product.quantity_tiers || product.quantity_tiers.length === 0) return [];
    if (product.quantity_tiers[0].tiers) {
      const sizeMatrix = product.quantity_tiers.find((m: any) => m.size === selectedSize);
      return sizeMatrix ? sizeMatrix.tiers : product.quantity_tiers[0].tiers;
    }
    return product.quantity_tiers;
  }, [product, selectedSize]);

  const unitPrice = useMemo(() => {
    if (!product) return 0;
    let base = product.price;
    if (activeTiers && activeTiers.length > 0) {
      const tier = [...activeTiers]
        .sort((a: any, b: any) => b.min_qty - a.min_qty)
        .find((t: any) => quantity >= t.min_qty);
      base = tier ? tier.unit_price : product.price;
    }
    if (selectedColor && product.colors) {
      const colorObj = product.colors.find((c: any) => c.name === selectedColor);
      if (colorObj?.extra_cost) base += colorObj.extra_cost;
    }
    const extraColorPrice = product.printing_config?.extra_color_price || 0;
    const extraColorsCost = (numColors > 1) ? (numColors - 1) * extraColorPrice : 0;
    let total = base + extraColorsCost;
    if (isDoubleSided) {
      const doubleSidedFixed = product.printing_config?.double_sided_price || 0;
      if (doubleSidedFixed > 0) total += (doubleSidedFixed * numColors);
      else total *= 2;
    }
    return total;
  }, [product, activeTiers, quantity, selectedColor, numColors, isDoubleSided]);

  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (!product) return;

    // Strict Validation
    if (product.sizes?.length > 0 && !selectedSize) {
      alert("يرجى اختيار المقاس");
      return;
    }
    if (product.colors?.length > 0 && !selectedColor) {
      alert("يرجى اختيار اللون");
      return;
    }
    if (product.custom_variants) {
      for (const group of product.custom_variants) {
        if (group.required && !customVariantSelections[group.label]) {
          alert(`يرجى اختيار ${group.label}`);
          return;
        }
      }
    }

    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}-${numColors}-${isDoubleSided ? '2' : '1'}-${JSON.stringify(customVariantSelections)}`,
      productId: product.id,
      name: product.name,
      price: unitPrice,
      quantity: quantity,
      image_url: product.image_url,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      num_colors: numColors,
      is_double_sided: isDoubleSided,
      custom_variant_selections: customVariantSelections
    });

    window.trackMarketingEvent?.("AddToCart", { 
      content_name: product.name, 
      value: unitPrice * quantity, 
      currency: "DZD",
      content_ids: [product.id]
    });

    useCartStore.getState().setIsOpen(true);
    close();
    router.push('/products');
  };

  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-md"
          />

          {/* Modal Container (Centered) */}
          <div key="modal-container" className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="pointer-events-auto w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left Image Section */}
              <div className="md:w-2/5 bg-gray-50 p-6 flex flex-col items-center justify-center relative">
                <button onClick={close} className="absolute top-4 right-4 md:hidden p-2 bg-white rounded-full shadow-md text-gray-500"><X size={20}/></button>
                <div className="w-full aspect-square relative rounded-3xl overflow-hidden shadow-lg border border-white">
                  <Image src={product.image_url} alt={product.name} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="font-black text-gray-900 line-clamp-1">{product.name}</h3>
                  <p className="text-primary font-bold text-sm">{product.category}</p>
                </div>
              </div>

              {/* Right Selection Section */}
              <div className="md:w-3/5 p-6 md:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                <div className="flex items-center justify-between hidden md:flex">
                  <div className="flex items-center gap-1 text-yellow-400"><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/><Star size={14} fill="currentColor"/></div>
                  <button onClick={close} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-all"><X size={22}/></button>
                </div>

                {/* Sizes */}
                {product.sizes?.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">المقاس المطلوب</label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map(s => (
                        <button 
                          key={s} 
                          onClick={() => setSelectedSize(s)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedSize === s ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                        >{s}</button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Colors */}
                {product.colors?.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">اختيار اللون</label>
                    <div className="flex flex-wrap gap-2">
                      {product.colors?.map(c => (
                        <button 
                          key={c.name} 
                          onClick={() => setSelectedColor(c.name)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 transition-all ${selectedColor === c.name ? 'border-primary bg-primary/5' : 'border-gray-100'}`}
                        >
                          <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }} />
                          <span className="text-xs font-bold text-gray-600">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantities */}
                {activeTiers.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الكمية</label>
                    <div className="grid grid-cols-3 gap-2">
                      {activeTiers?.map((t: any) => (
                        <button 
                          key={t.min_qty} 
                          onClick={() => setQuantity(t.min_qty)}
                          className={`p-2 rounded-xl border-2 transition-all text-center ${quantity === t.min_qty ? 'border-primary bg-primary/5 text-primary' : 'border-gray-50 text-gray-400 text-xs'}`}
                        >
                          <div className="font-black">{t.min_qty}</div>
                          <div className="text-[9px] opacity-70">{t.unit_price}دج</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Printing */}
                {(product.printing_config?.extra_color_price || 0) > 0 && (
                  <div className="p-4 bg-gray-50 rounded-2xl flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">عدد الألوان:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(n => (
                          <button key={n} onClick={() => setNumColors(n)} className={`w-8 h-8 rounded-lg font-black text-xs transition-all ${numColors === n ? 'bg-primary text-white' : 'bg-white text-gray-400 border border-gray-100'}`}>{n}</button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500">الطباعة:</span>
                      <div className="flex bg-white p-1 rounded-lg border border-gray-100">
                        <button onClick={() => setIsDoubleSided(false)} className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${!isDoubleSided ? 'bg-primary text-white' : 'text-gray-400'}`}>جهة</button>
                        <button onClick={() => setIsDoubleSided(true)} className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${isDoubleSided ? 'bg-primary text-white' : 'text-gray-400'}`}>جهتين</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Actions */}
                <div className="mt-auto space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-400 uppercase">المجموع الفرعي</span>
                        <span className="text-2xl font-black text-gray-900">{totalPrice.toLocaleString()} <span className="text-sm text-primary">د.ج</span></span>
                     </div>
                     <div className="text-left">
                        <span className="text-[10px] font-black text-green-500 uppercase tracking-tighter">سعر القطعة</span>
                        <p className="text-xs font-bold text-gray-500">{unitPrice} د.ج / للوحدة</p>
                     </div>
                  </div>
                  <button 
                    onClick={handleAddToCart}
                    className="w-full bg-primary text-white h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                  >
                    <ShoppingCart size={22} />
                    أضف للسلة الآن
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
