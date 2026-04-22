"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import OrderForm from "@/components/OrderForm";

import { useCartStore } from "@/store/cartStore";
import Image from "next/image";
import Link from "next/link";
import {
  Star, ShieldCheck, Truck, RefreshCcw, ChevronRight,
  CheckCircle2, Package, Zap, Crown, Tag, Gift, Sparkles, ShoppingBag, ArrowLeft, Search
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { motion } from "framer-motion";
import { Product } from "@/types";

// Fallback for demo when Supabase not connected
const DEMO_PRODUCT: Product = {
  id: "1",
  name: "أكياس ورقية كرافت (Kraft Bags)",
  description: "أكياس الكرافت البنية الكلاسيكية هي الخيار الأمثل للعلامات التجارية التي تبحث عن المظهر الطبيعي والبيئي. تتميز بقوة تحمل عالية وتناسب محلات الملابس، الوجبات السريعة، والمقاهي. السعر المعروض هو للقطعة الواحدة (الحد الأدنى للطلب يحدد في المراسلة).",
  short_description: "صديقة للبيئة مع طباعة الشعار بلون أو لونين.",
  price: 35.00,
  compare_price: 45.00,
  image_url: "https://placehold.co/800x800/d2b48c/ffffff.png?text=Kraft+Bag",
  gallery: [
    "https://placehold.co/800x800/d2b48c/000000.png?text=Kraft+Bag+Back",
  ],
  category: "أكياس ورقية",
  sizes: ["صغير", "متوسط", "كبير"],
  colors: [] as { name: string; hex: string }[],
  stock: 10000,
  is_published: true,
  is_featured: false,
};

export default function ProductClient({ initialProduct }: { initialProduct: Product | null }) {
  const [product, setProduct] = useState<Product | null>(initialProduct);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState<number>(200); 
  const [numColors, setNumColors] = useState<number>(1);
  const [isDoubleSided, setIsDoubleSided] = useState<boolean>(false);
  const [showToast, setShowToast] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [customVariantSelections, setCustomVariantSelections] = useState<Record<string, string>>({});

  // Combine all possible images into one gallery - Memoized for stability
  const allImages = useMemo(() => {
    if (!product) return [];
    const variantExtraImages = product.variant_images?.map((vi: { image_url: string }) => vi.image_url) || [];
    return Array.from(new Set([
      product.image_url, 
      ...(product.gallery || []), 
      ...variantExtraImages
    ])).filter(Boolean);
  }, [product]);
  const { 
    addItem, 
    customerStatus, 
    setCustomerStatus, 
    customer,
    appliedVipOffer, 
    setAppliedVipOffer,
    discountConfig,
    setDiscountConfig
  } = useCartStore();
  
  const [localCustomer, setLocalCustomer] = useState<any>(null);

  // Sync with store
  useEffect(() => {
    if (customer) setLocalCustomer(customer);
  }, [customer]);
  
  const router = useRouter();

  useEffect(() => {
    // Auto-set the first size if available
    if (product && !selectedSize) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0]);
      }
      
      // Auto-set initial quantity based on standard or matrix logic
      let initialTiers = product.quantity_tiers;
      if (initialTiers && initialTiers.length > 0) {
         if (initialTiers[0].tiers) {
           initialTiers = initialTiers[0].tiers;
         }
         setQuantity(initialTiers?.[0]?.min_qty || 1);
      }
    }
  }, [product]);

  useEffect(() => {
      const phone = sessionStorage.getItem("servseri_phone");
      if (phone) {
        async function fetchVip() {
          try {
            const res = await fetch("/api/customer", {
              method: "POST",
              body: JSON.stringify({ phone }),
            });
            const data = await res.json();
              if (data.customer) {
                const status = (data.customer.total_orders || 0) === 0 ? 'new' : 'vip';
                setCustomerStatus(status, data.customer);
                setLocalCustomer(data.customer);
                
                if (data.discountConfig) {
                  setDiscountConfig({
                    enabled: data.discountConfig.newCustomerDiscountEnabled,
                    percentage: data.discountConfig.newCustomerDiscountPercent,
                    discountType: data.discountConfig.newCustomerDiscountType || 'percentage',
                    minItems: data.discountConfig.newCustomerMinItems,
                  });
                }
                
                if (status === 'vip' && data.vipOffers && data.vipOffers.length > 0) {
                  // Only auto-set if none exists
                  if (!appliedVipOffer) setAppliedVipOffer(data.vipOffers[0]);
                }
              }
          } catch (err) { console.error("VIP fetch error:", err); }
        }
        fetchVip();
      }

      async function fetchAllProducts() {
        if (!supabase) {
          setAllProducts([]);
          return;
        }
        const { data } = await supabase.from("products").select("*").eq("is_published", true);
        if (data) setAllProducts(data);
      }
      fetchAllProducts();
  }, [setCustomerStatus, setDiscountConfig, setAppliedVipOffer]);

  // Image Switching Logic
  useEffect(() => {
    if (!product || !product.variant_images || product.variant_images.length === 0) return;

    const trimmedSize = selectedSize?.trim();
    const trimmedColor = selectedColor?.trim();

    // 1. Try exact match (Both size and color)
    let match = product.variant_images.find((vi: any) => 
      vi.size?.trim() === trimmedSize && 
      vi.color?.trim() === trimmedColor &&
      vi.size && vi.color
    );

    // 2. Fallback to Color match
    if (!match && trimmedColor) {
      match = product.variant_images.find((vi: any) => 
        (!vi.size || vi.size.trim() === "") && 
        vi.color?.trim() === trimmedColor
      );
    }

    // 3. Fallback to Size match
    if (!match && trimmedSize) {
      match = product.variant_images.find((vi: any) => 
        (!vi.color || vi.color.trim() === "") && 
        vi.size?.trim() === trimmedSize
      );
    }

    if (match) {
      const variantIdx = allImages.indexOf(match.image_url);
      if (variantIdx !== -1) {
        setSelectedImage(variantIdx);
      }
    }
  }, [selectedSize, selectedColor, product, allImages]);

  // Handle color availability mapping logic
  const availableColors = useMemo(() => {
    if (!product) return [];
    if (!product.size_color_availability || Object.keys(product.size_color_availability).length === 0) {
      return product.colors || [];
    }
    const colorNames = product.size_color_availability[selectedSize];
    if (!colorNames) return product.colors || []; // Fallback to all if size not mapped
    return (product.colors || []).filter((c: any) => colorNames.includes(c.name));
  }, [product, selectedSize]);

  // Auto-reset or switch color if it becomes unavailable for the new size
  useEffect(() => {
    if (!selectedSize || availableColors.length === 0) return;
    const isStillAvailable = availableColors.find((c: any) => c.name === selectedColor);
    if (!isStillAvailable && selectedColor !== "") {
      setSelectedColor(availableColors[0]?.name || "");
    }
  }, [availableColors, selectedColor, selectedSize]);

  // Handle sticky mobile button visibility
  useEffect(() => {
    const handleScroll = () => {
      const formElement = document.getElementById("order-form-section");
      if (!formElement) return;

      const rect = formElement.getBoundingClientRect();
      const isPastForm = rect.top < 0 && rect.bottom < 0; // scrolled way past it
      const isBeforeForm = rect.top > window.innerHeight; // haven't reached it yet

      // Show button if the form is NOT currently visible in viewport AND we've scrolled down a bit
      if ((isPastForm || isBeforeForm) && window.scrollY > 300) {
        setShowStickyButton(true);
      } else {
        setShowStickyButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-gray-500 font-bold">جاري تحميل المنتج...</p>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
        <div>
          <Package size={64} className="text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-gray-700 mb-2">المنتج غير موجود</h1>
          <Link href="/products" className="text-primary font-bold hover:underline">العودة للمنتجات</Link>
        </div>
      </main>
    );
  }

  
  // ── Pricing Logic (Tiered + Printing + VIP) ──────────────────
  const getActiveTiers = () => {
    if (!product || !product.quantity_tiers || product.quantity_tiers.length === 0) return [];
    
    // Check if it's Matrix Pricing
    if (product.quantity_tiers[0].tiers) {
      const sizeMatrix = product.quantity_tiers.find((m: any) => m.size === selectedSize);
      return sizeMatrix ? sizeMatrix.tiers : product.quantity_tiers[0].tiers;
    }
    return product.quantity_tiers; // Standard flat pricing
  };

  const getBaseUnitPrice = () => {
    if (!product) return 0;
    
    const activeTiers = getActiveTiers();
    let computedBasePrice = product.price;

    if (activeTiers && activeTiers.length > 0) {
      // Find the highest tier that is <= quantity
      const applicableTier = [...activeTiers]
        .sort((a: any, b: any) => b.min_qty - a.min_qty)
        .find((t: { min_qty: number; unit_price: number }) => quantity >= t.min_qty);
      computedBasePrice = applicableTier ? applicableTier.unit_price : product.price;
    }

    // Add extra cost based on selected color
    if (selectedColor && product.colors) {
      const colorObj = product.colors.find((c: any) => c.name === selectedColor);
      if (colorObj && colorObj.extra_cost) {
        computedBasePrice += colorObj.extra_cost;
      }
    }

    return computedBasePrice;
  };

  const unitPriceAfterPrinting = () => {
    const base = getBaseUnitPrice();
    const extraColorPrice = product?.printing_config?.extra_color_price || 0;
    const doubleSidedFixedCost = product?.printing_config?.double_sided_price || 0;
    
    // (numColors - 1) * extraColorPrice
    const extraColorsCost = (numColors > 1) ? (numColors - 1) * extraColorPrice : 0;
    let totalUnit = base + extraColorsCost;
    
    if (isDoubleSided) {
       if (doubleSidedFixedCost > 0) {
          totalUnit += (doubleSidedFixedCost * numColors);
       } else {
          totalUnit *= 2; // legacy fallback
       }
    }
    return totalUnit;
  };

  const basePrice = unitPriceAfterPrinting() * quantity;
  let effectivePrice = basePrice;
  let hasVipDiscount = false;
  let discountLabel = "";
  let savingAmount = 0;

  if (customerStatus === 'vip' && appliedVipOffer) {
    hasVipDiscount = true;
    if (appliedVipOffer.discount_type === 'percentage') {
      savingAmount = Math.round(basePrice * (appliedVipOffer.discount_value / 100));
    } else {
      savingAmount = appliedVipOffer.discount_value;
    }
    effectivePrice = basePrice - savingAmount;
    discountLabel = `خصم VIP: ${appliedVipOffer.title}`;
  }

  const originalPrice = (product.compare_price ? product.compare_price * quantity : null);
  const discountPercent = originalPrice
    ? Math.round((1 - effectivePrice / originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    // The OrderForm component handles validation before calling this function
    const customVarLabel = Object.entries(customVariantSelections)
      .filter(([_, v]) => v) // only include if value is set
      .map(([k, v]) => `${k}: ${v}`).join(" / ");
      
    addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}-${numColors}-${isDoubleSided ? '2sided' : '1sided'}-${JSON.stringify(customVariantSelections)}`,
      productId: product.id,
      name: `${product.name}`,
      price: effectivePrice / quantity,
      quantity: quantity,
      image_url: allImages[selectedImage] || product.image_url,
      size: selectedSize || undefined,
      color: selectedColor || undefined,
      num_colors: numColors,
      is_double_sided: isDoubleSided,
      custom_variant_selections: customVariantSelections
    });

    window.trackMarketingEvent?.("AddToCart", { 
      content_name: product.name, 
      value: effectivePrice, 
      currency: "DZD",
      content_ids: [product.id]
    });

    // Show success message and stay on page
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    // useCartStore.getState().setIsOpen(true);
    // router.push('/products');
  };

  return (
    <main className="min-h-screen bg-transparent">
      <div className="pt-8">
      


      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500 text-right">
          <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ChevronRight size={14} className="rotate-180" />
          <Link href="/products" className="hover:text-primary transition-colors">المنتجات</Link>
          <ChevronRight size={14} className="rotate-180" />
          <span className="text-gray-900 font-bold">{product.name}</span>
        </div>
      </div>

      {/* Floating Toast Notification */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: showToast ? 1 : 0, y: showToast ? 0 : -50 }}
        className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
      >
        <div className="bg-gray-900/90 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-3 backdrop-blur-md border border-gray-700">
           <CheckCircle2 className="text-[#25D366]" size={20} />
           تمت إضافة المنتج إلى السلة بنجاح
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

          {/* ==================== LEFT: Images ==================== */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl relative"
            >
              {allImages[selectedImage] ? (
                <Image
                  src={allImages[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-200">
                  <Package size={80} />
                </div>
              )}
              {discountPercent > 0 && (
                <div className="absolute top-5 right-5 bg-red-500 text-white text-sm font-black px-4 py-2 rounded-2xl shadow-lg">
                  -{discountPercent}%
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-4 custom-scrollbar snap-x">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 snap-start w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all relative ${
                      selectedImage === i ? "border-primary shadow-lg shadow-primary/20" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ==================== RIGHT: Info + Form ==================== */}
          <div className="space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm space-y-6">
              {/* Category & Rating */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex text-yellow-400 gap-0.5 shrink-0">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
                  <span className="text-gray-400 text-sm font-bold mr-2">(120+ تقييم)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.category?.split(',').map((cat, i) => (
                    <span key={i} className="text-primary text-[10px] sm:text-xs font-black bg-primary/10 px-3 py-1.5 rounded-full uppercase tracking-wide text-center">
                      {cat.trim()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl font-black text-gray-950 leading-tight mb-2">{product.name}</h1>
                {product.short_description && (
                  <p className="text-gray-500 font-medium">{product.short_description}</p>
                )}
              </div>

              {/* Price Section */}
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                   {hasVipDiscount && (
                     <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest animate-in fade-in slide-in-from-right-4">
                        <Crown size={14} className="fill-primary" />
                        <span>عرض حصري لك كعضو مميز</span>
                     </div>
                   )}
                   <div className="flex items-end gap-3">
                    <span className="text-4xl font-black text-gray-950">
                      {effectivePrice.toLocaleString()} <span className="text-xl text-primary">د.ج</span>
                    </span>
                    {(originalPrice || hasVipDiscount) && (
                      <span className="text-xl text-gray-400 line-through mb-1">
                        {(hasVipDiscount ? basePrice : originalPrice!).toLocaleString()} د.ج
                      </span>
                    )}
                  </div>
                </div>

                {/* Welcome Upsell Alert (Only for New/Guest) */}
                {customerStatus !== 'vip' && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm"
                  >
                    <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-yellow-400/20 animate-bounce">
                      <Gift size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-yellow-800">هدية ترحيبية للزبائن الجدد! 🎁</p>
                      <p className="text-[10px] font-bold text-yellow-700/70 leading-tight mt-0.5">
                        أهلاً بك في أول طلب لك! أضف {discountConfig.minItems} قطع أو أكثر واحصل على تخفيض {discountConfig.percentage}% فوري.
                      </p>
                    </div>
                  </motion.div>
                )}

              </div>

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                    المقاس
                    {selectedSize && <span className="text-primary font-bold">({selectedSize})</span>}
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size === selectedSize ? "" : size)}
                        className={`px-5 py-2.5 rounded-xl font-bold border-2 transition-all ${
                          selectedSize === size
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                    اللون
                    {selectedColor && <span className="text-primary font-bold">({selectedColor})</span>}
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {availableColors?.map((color: any) => (
                      <button
                        key={color.name}
                        onClick={() => setSelectedColor(color.name === selectedColor ? "" : color.name)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold transition-all ${
                          selectedColor === color.name
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                        title={color.name}
                      >
                        <span
                          className="w-5 h-5 rounded-full border border-gray-200 shadow-inner"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-sm text-gray-700 font-bold">
                           {color.name}
                           {color.extra_cost ? <span className="text-primary mr-1 text-xs">(+{color.extra_cost} د.ج)</span> : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Tiers (Strict Selection) */}
              {getActiveTiers().length > 0 && (
                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <label className="text-sm font-black text-gray-700 block">اختر كمية الطلب</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {getActiveTiers().map((tier: { min_qty: number; unit_price: number }) => (
                      <button
                        key={tier.min_qty}
                        onClick={() => setQuantity(tier.min_qty)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 shadow-sm ${
                          quantity === tier.min_qty
                            ? "border-primary bg-primary/10 text-primary shadow-primary/10"
                            : "border-gray-100 bg-white text-gray-600 hover:border-gray-200"
                        }`}
                      >
                        <span className="text-sm font-black">{tier.min_qty} قطعة</span>
                        <span className="text-[10px] font-bold opacity-70">{tier.unit_price} د.ج / للقطعة</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Printing Options */}
              {(((product?.printing_config?.extra_color_price || 0) > 0) || ((product?.printing_config?.double_sided_price || 0) > 0)) && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                   <div className="flex flex-col sm:flex-row gap-4">
                      {/* Num Colors */}
                      {(product?.printing_config?.extra_color_price || 0) > 0 && (
                        <div className="flex-1 space-y-2">
                           <label className="text-xs font-black text-gray-500 uppercase tracking-tighter">عدد ألوان التصميم</label>
                           <select 
                             value={numColors}
                             onChange={(e) => setNumColors(Number(e.target.value))}
                             className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-bold outline-none focus:ring-2 focus:ring-primary/20"
                           >
                              {[1, 2, 3, 4].map(n => {
                                 const extraCost = (n - 1) * (product?.printing_config?.extra_color_price || 0);
                                 const labelStr = n === 1 ? 'لون واحد' : n === 2 ? 'لونين' : `${n} ألوان`;
                                 const priceStr = extraCost > 0 ? ` (+${extraCost} د.ج)` : '';
                                 return <option key={n} value={n}>{labelStr}{priceStr}</option>;
                              })}
                           </select>
                        </div>
                      )}
                      {/* Double Sided Toggle */}
                      {(product?.printing_config?.double_sided_price || 0) > 0 && (
                        <div className="flex-1 space-y-2">
                           <label className="text-xs font-black text-gray-500 uppercase tracking-tighter">مكان الطباعة</label>
                           <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-200">
                              <button 
                                onClick={() => setIsDoubleSided(false)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${!isDoubleSided ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                              >جهة واحدة</button>
                              <button 
                                onClick={() => setIsDoubleSided(true)}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${isDoubleSided ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                              >جهتين (Double)</button>
                           </div>
                        </div>
                      )}
                   </div>

                 {/* Price Breakdown Helper */}
                 <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mt-4 overflow-hidden">
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between text-sm font-bold text-gray-500">
                         <span>سعر القطعة الأساسي:</span>
                         <span className="text-gray-900 font-black">{getBaseUnitPrice()} د.ج</span>
                      </div>
                      {numColors > 1 && (
                        <div className="flex justify-between text-sm font-bold text-gray-500">
                          <span>إضافة {numColors - 1} ألوان إضافية:</span>
                          <span className="text-gray-900 font-black">+{((numColors - 1) * (product?.printing_config?.extra_color_price || 0))} د.ج</span>
                        </div>
                      )}
                      {isDoubleSided && (
                        <div className="flex justify-between text-sm font-bold text-primary pt-3 border-t border-gray-50">
                           <span>تكلفة الطباعة على جهتين:</span>
                           <span className="font-black">{product?.printing_config?.double_sided_price ? `+${product.printing_config.double_sided_price * numColors} د.ج` : '× 2'}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between items-center bg-primary/10 px-5 py-4 border-t border-primary/20">
                       <span className="text-sm font-black text-primary">السعر النهائي للقطعة:</span>
                       <span className="text-xl font-black text-primary">{unitPriceAfterPrinting()} <span className="text-xs">د.ج</span></span>
                    </div>
                 </div>
              </div>
              )}

              {/* Custom Variant Groups */}
              {product.custom_variants && product.custom_variants.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  {product.custom_variants?.map((group: any, gIdx: number) => (
                    <div key={`cv-${gIdx}`} className="space-y-2">
                       <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                        {group.label}
                        {group.required && <span className="text-[10px] text-red-500 font-bold">(إجباري)</span>}
                        {customVariantSelections[group.label] && (
                          <span className="text-primary font-bold text-xs">({customVariantSelections[group.label]})</span>
                        )}
                      </label>
                      <div className="flex gap-2 flex-wrap">
                        {group.options?.map((opt: string) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => setCustomVariantSelections(prev => ({
                              ...prev,
                              [group.label]: prev[group.label] === opt ? "" : opt
                            }))}
                            className={`px-5 py-2.5 rounded-xl font-bold border-2 transition-all text-sm ${
                              customVariantSelections[group.label] === opt
                                ? "border-primary bg-primary/10 text-primary shadow-sm"
                                : "border-gray-200 text-gray-600 hover:border-gray-300 bg-white"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}


            </div>

            {/* Add to Cart & Order Actions */}
            <div id="order-form-section" className="space-y-4">
              <OrderForm
                product={product}
                productId={product.id}
                productName={product.name}
                productPrice={effectivePrice}
                quantity={quantity}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                numColors={numColors}
                isDoubleSided={isDoubleSided}
                appliedOfferId={appliedVipOffer?.id}
                discountAmount={savingAmount}
                customVariantSelections={customVariantSelections}
                onAddToCart={handleAddToCart}
              />

              {/* Returning Customer & Rank Info (Bottom Position + Responsive) */}
              {customerStatus === 'vip' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border-2 border-primary/20 rounded-[2.5rem] p-5 sm:p-7 shadow-xl shadow-primary/5 space-y-5 relative overflow-hidden group"
                >
                  {/* Decorative background logo icon */}
                  <div className="absolute -bottom-8 -left-8 opacity-[0.04] group-hover:scale-110 transition-transform pointer-events-none">
                     <Crown size={140} />
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transition-transform group-hover:rotate-6 shrink-0">
                        <Crown size={28} />
                      </div>
                      <div>
                        <h4 className="font-black text-gray-900 text-lg leading-tight uppercase tracking-widest">
                           عضويتك المميزة مفعلة
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                           <div className="flex text-yellow-400 gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  size={14} 
                                  fill={i < (localCustomer?.star_level || 1) ? "currentColor" : "none"} 
                                  className={i < (localCustomer?.star_level || 1) ? "" : "text-gray-200"} 
                                />
                              ))}
                           </div>
                           <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                             VIP MEMBER
                           </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl sm:rounded-none">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0 sm:mb-1">توفيرك الحالي</p>
                      <p className="text-2xl font-black text-primary">-{savingAmount.toLocaleString()} د.ج</p>
                    </div>
                  </div>

                  <div className="bg-primary/[0.03] rounded-2xl p-4 flex items-start gap-3 text-xs font-bold text-primary/80 border border-primary/10 relative z-10 leading-relaxed">
                     <Sparkles size={16} className="shrink-0 mt-0.5 text-primary" />
                     <span>بما أنك زبون مميز، استمتع بأسعارك الخاصة المطبقة تلقائياً على سلتك فوراً.</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm">
                <h3 className="font-black text-gray-900 mb-3 text-lg">وصف المنتج</h3>
                <p className="text-gray-600 leading-loose">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Discover More Section */}
      <section className="bg-white py-16 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
            <div className="text-right">
              <h2 className="text-3xl font-black text-gray-950 mb-2">اكتشف المزيد من خدماتنا</h2>
              <p className="text-gray-500 font-bold">كل ما تحتاجه لعلامتك التجارية في مكان واحد</p>
            </div>
            <Link href="/products" className="group flex items-center gap-2 text-primary font-black hover:gap-4 transition-all">
              عرض المتجر الكامل <ArrowLeft size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(allProducts.length > 0 ? allProducts : [])
              .filter(p => p.id !== product?.id)
              .sort(() => 0.5 - Math.random())
              .slice(0, 4)
              .map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
          </div>
          
          <div className="mt-12 text-center">
             <Link href="/products">
                <button className="bg-gray-100 text-gray-700 px-10 py-4 rounded-2xl font-black hover:bg-primary hover:text-white transition-all shadow-sm">
                   الذهاب لجميع المنتجات
                </button>
             </Link>
          </div>
        </div>
      </section>
    </div>

      {/* Sticky Mobile Order Button */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: showStickyButton ? 0 : 100 }}
        className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] lg:hidden flex items-center justify-between gap-4"
      >
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-500 uppercase">السعر الإجمالي</span>
          <span className="text-xl font-black text-gray-900 leading-none">
            {effectivePrice.toLocaleString()} <span className="text-sm text-primary">د.ج</span>
          </span>
        </div>
        <button
          onClick={() => {
            const form = document.getElementById("order-form-section");
            if (form) {
              const yOffset = -80; // account for fixed header
              const y = form.getBoundingClientRect().top + window.scrollY + yOffset;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          }}
          className="flex-1 bg-primary text-white py-3.5 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-lg shadow-primary/30 active:scale-95 transition-all"
        >
          <Package size={20} />
          اطلب الآن
        </button>
      </motion.div>

    </main>
  );
}
