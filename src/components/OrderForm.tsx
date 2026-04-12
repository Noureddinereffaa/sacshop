"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Phone, User, Loader2, Edit3, MessageCircle, 
  ShoppingCart, Lock, Eye, EyeOff, CheckCircle2, 
  Gift, Package 
} from "lucide-react";
import Link from "next/link";
import { CartItem, Product } from "@/types";
import { generateAndUploadOrderPDF } from "@/utils/generateOrderPDF";
import { useCartStore } from "@/store/cartStore";

interface OrderFormProps {
  productId: string;
  productName: string;
  productPrice: number;
  selectedSize?: string;
  selectedColor?: string;
  appliedOfferId?: string;
  cartItems?: CartItem[];
  quantity?: number;
  product?: Product;
  discountAmount?: number;
  numColors?: number;
  isDoubleSided?: boolean;
  customVariantSelections?: Record<string, string>;
  onAddToCart?: () => void;
}

// step: "info" → "success"
type Step = "info" | "success";

export default function OrderForm({ 
  productId, 
  productName, 
  productPrice, 
  selectedSize, 
  selectedColor, 
  appliedOfferId, 
  cartItems = [], 
  quantity = 1, 
  discountAmount = 0, 
  numColors,
  isDoubleSided,
  customVariantSelections = {},
  product,
  onAddToCart 
}: OrderFormProps) {
  const [step, setStep] = useState<Step>("info");
  const [isLoading, setIsLoading] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);

  const router = useRouter();
  const successRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to success card when order is completed
  useEffect(() => {
    if (step === "success" && successRef.current) {
      successRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [step]);
  const [pendingWaLink, setPendingWaLink] = useState<string>("");
  const [pendingOrderId, setPendingOrderId] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("213000000000");

  const [formData, setFormData] = useState({ name: "", phone: "", notes: "" });

  // Auto-fill form if session exists
  useEffect(() => {
    const storedPhone = sessionStorage.getItem("sacshop_phone");
    const storedName = sessionStorage.getItem("sacshop_name");
    if (storedPhone && storedName) {
      setFormData(prev => ({ ...prev, phone: storedPhone, name: storedName }));
    }
  }, []);

  // Fetch WhatsApp number from Settings
  useEffect(() => {
    async function fetchSettings() {
      if (!supabase) return;
      const { data } = await supabase.from("settings").select("*");
      if (data) {
        const map = data.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
        if (map.branding?.whatsappNumber) setWhatsappNumber(map.branding.whatsappNumber);
      }
    }
    fetchSettings();
  }, []);

  // Track ViewContent
  useEffect(() => {
    try {
      window.trackMarketingEvent?.("ViewContent", { content_name: productName, value: productPrice, currency: "DZD" });
    } catch { /* non-critical */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productName]);

  const validateSelections = () => {
    if (!product) return true;
    
    // Check Size
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("يرجى اختيار المقاس المطلوب أولاً");
      return false;
    }
    
    // Check Color
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      alert("يرجى اختيار اللون المطلوب أولاً");
      return false;
    }
    
    // Check Custom Variants
    if (product.custom_variants && product.custom_variants.length > 0) {
      for (const group of product.custom_variants) {
        if (group.required && !customVariantSelections[group.label]) {
          alert(`يرجى اختيار ${group.label} أولاً`);
          return false;
        }
      }
    }
    
    return true;
  };

  // ─── STEP 1: Validate form and check if user exists ────────────────────────
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isPdfGenerating || step === "success") return;
    
    // Validate selections before showing details form
    if (!validateSelections()) return;

    if (!formData.name.trim() || !formData.phone.trim()) return;
    setIsLoading(true);

    try {
      // Direct order creation — no passwords, no extra steps
      await createOrderAndGetWaLink();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء معالجة الطلب. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Build order + WhatsApp message ────────────────────────────────────────
  const createOrderAndGetWaLink = async () => {
    if (!supabase) throw new Error("Supabase not configured");

    const isCartOrder = cartItems && cartItems.length > 0;
    const orderId = crypto.randomUUID();
    const waNumber = whatsappNumber.replace(/[^0-9]/g, "");
    const shortId = orderId.split("-")[0].toUpperCase();

    // ── Save order to database first ─────────────────────────────────────────
    const { error } = await supabase.from("orders").insert({
      id: orderId,
      customer_name: formData.name.trim(),
      customer_phone: formData.phone.trim(),
      customer_address: "يُحدد عبر واتساب",
      product_id: isCartOrder ? null : productId,
      quantity: isCartOrder ? null : quantity,
      size: isCartOrder ? null : selectedSize,
      color: isCartOrder ? null : selectedColor,
      product_price: isCartOrder ? 0 : productPrice,
      total_price: productPrice,
      applied_offer_id: appliedOfferId || null,
      status: "new",
      cart_items: isCartOrder ? cartItems : [],
      admin_notes: formData.notes.trim() || null,
      metadata: !isCartOrder ? { 
        num_colors: numColors, 
        is_double_sided: isDoubleSided,
        custom_variants: customVariantSelections
      } : null
    });
    if (error) throw new Error(error.message);

    // ── Generate PDF and upload to Supabase Storage ───────────────────────────
    setIsPdfGenerating(true);
    let pdfUrl: string | null = null;
    try {
      pdfUrl = await generateAndUploadOrderPDF({
        orderId,
        customerName: formData.name.trim(),
        customerPhone: formData.phone.trim(),
        productName,
        quantity,
        productPrice,
        discountAmount,
        selectedSize,
        selectedColor,
        notes: formData.notes.trim() || undefined,
        cartItems: isCartOrder ? cartItems : undefined,
        numColors,
        isDoubleSided,
        customVariantSelections,
      });

      // Also save PDF URL in order record (avoiding extra select to bypass RLS issues)
      const currentNotes = formData.notes.trim();
      const updatedNotes = (currentNotes ? currentNotes + "\n" : "") + `pdf_url:${pdfUrl}`;
      await supabase.from("orders").update({ admin_notes: updatedNotes }).eq("id", orderId);
    } catch (pdfErr) {
      console.error("PDF Generation Error:", pdfErr);
    } finally {
      setIsPdfGenerating(false);
    }

    // ── Build WhatsApp message ────────────────────────────────────────────────
    let waMessage: string;
    if (pdfUrl) {
      waMessage = [
        `✅ *طلب جديد من Service Serigraphie*`,
        `👤 الاسم: ${formData.name.trim()}`,
        `📱 الهاتف: ${formData.phone.trim()}`,
        ``,
        `📄 *وصل الطلب الرسمي (PDF):*`,
        pdfUrl,
        ``,
        `🏷️ رقم الطلب: #${shortId}`,
      ].join("\n");
    } else {
      const cartItemsSummary = isCartOrder ? cartItems.map((item, idx) => {
        const itemVariants = [
          item.size ? `📐 ${item.size}` : '',
          item.color ? `🎨 ${item.color}` : '',
          item.num_colors ? `✨ ${item.num_colors} ألوان ${item.is_double_sided ? '(جهتين)' : '(جهة)'}` : '',
          item.custom_variant_selections ? Object.entries(item.custom_variant_selections).filter(([_, v]) => v).map(([k, v]) => `▫️ ${k}: ${v}`).join(", ") : ''
        ].filter(Boolean).join(" | ");
        
        return `${idx + 1}. *${item.name}* (x${item.quantity})\n   ${itemVariants}`;
      }).join("\n\n") : "";

      const variantText = !isCartOrder ? Object.entries(customVariantSelections)
        .filter(([_, val]) => val)
        .map(([key, val]) => `▫️ ${key}: ${val}`)
        .join("\n") : "";

      waMessage = [
        `✅ *طلب جديد من Service Serigraphie*`,
        `👤 الاسم: ${formData.name.trim()}`,
        `📱 الهاتف: ${formData.phone.trim()}`,
        ``,
        isCartOrder ? `🛒 *محتويات السلة:*` : `📦 المنتج: ${productName}`,
        isCartOrder ? cartItemsSummary : `${variantText ? `✨ الخيارات:\n${variantText}\n` : ''}🎨 الطباعة: ${numColors} ألوان ${isDoubleSided ? '(جهتين)' : ''}`,
        ``,
        `💰 المجموع الإجمالي: ${productPrice.toLocaleString()} د.ج`,
        ``,
        `⚠️ (الوصل متاح في حسابك الشخصي)`,
        `🏷️ رقم الطلب: #${shortId}`,
      ].filter(Boolean).join("\n");
    }

    // ── Marketing tracking ────────────────────────────────────────────────────
    try {
      window.trackMarketingEvent?.("SubmitOrder", {
        content_name: isCartOrder ? "Cart Order" : productName,
        value: productPrice,
        currency: "DZD",
        num_items: isCartOrder ? cartItems.length : 1,
      });
    } catch { /* non-critical */ }

    setPendingOrderId(orderId);
    const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
    setPendingWaLink(waLink);
    setStep("success");

    // ── Save session for automatic login ──
    sessionStorage.setItem("sacshop_phone", formData.phone.trim());
    sessionStorage.setItem("sacshop_name", formData.name.trim());

    if (isCartOrder) {
      useCartStore.getState().clearCart();
    }
  };

  // ─── SUCCESS SCREEN ─────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <motion.div
        ref={successRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl border-2 border-[#25D366]/40 shadow-xl text-center space-y-5"
      >
        <div className="w-20 h-20 bg-[#25D366]/15 rounded-full flex items-center justify-center text-[#25D366] mx-auto">
          <CheckCircle2 size={44} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">تم تسجيل طلبك! ✅</h2>
          {discountAmount > 0 && (
            <div className="mt-1 flex items-center justify-center gap-1.5 text-primary font-black text-sm bg-primary/10 px-4 py-1.5 rounded-full w-max mx-auto border border-primary/20">
               <Gift size={16} />
               <span>لقد وفرت {discountAmount.toLocaleString()} د.ج في هذا الطلب!</span>
            </div>
          )}
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            اضغط على الزر أدناه لفتح واتساب وإتمام التأكيد مع فريقنا.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {pendingWaLink && (
            <button
              onClick={() => {
                window.open(pendingWaLink, "_blank");
                router.push("/account");
              }}
              className="group flex flex-col items-center justify-center gap-2 w-full bg-[#25D366] text-white rounded-[2rem] py-8 px-6 font-black shadow-xl shadow-green-200 active:scale-95 transition-all hover:bg-[#20bd5b]"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <div className="flex items-center gap-3 text-2xl">
                <MessageCircle size={32} className="animate-bounce" />
                تأكيد الطلب عبر واتساب
              </div>
              <p className="text-xs opacity-80 font-bold">(سيتم فتح واتساب في نافذة جديدة)</p>
            </button>
          )}
          {/* Optional Direct Download if account exists or after creation */}
          <Link 
            href="/account"
            className="flex items-center justify-center gap-2 text-sm font-black text-gray-500 hover:text-primary transition-colors py-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200"
          >
            <Package size={16} />
            عرض طلباتي في لوحة التحكم
          </Link>
        </div>
        <p className="text-xs text-gray-400">
          رقم الطلب: #{pendingOrderId.split("-")[0].toUpperCase()}
        </p>
      </motion.div>
    );
  }



  // ─── STEP 1: INFO FORM ──────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-100 shadow-xl">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-[#25D366]/10 rounded-2xl flex items-center justify-center text-[#25D366] shrink-0">
            <MessageCircle size={22} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-950">الطلب عبر واتساب</h2>
            <p className="text-gray-400 font-semibold text-xs">أدخل بياناتك ليتم تأكيد طلبك</p>
          </div>
        </div>

        <form onSubmit={handleInfoSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">الاسم الكامل *</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="text"
                  placeholder="الاسم..."
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 outline-none font-medium text-base"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 block">رقم الهاتف (واتساب) *</label>
              <div className="relative">
                <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  required
                  type="tel"
                  inputMode="tel"
                  placeholder="05 / 06 / 07 ..."
                  dir="ltr"
                  className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-left text-base"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 block">ملاحظات إضافية (اختياري)</label>
            <div className="relative">
              <Edit3 className="absolute right-4 top-4 text-gray-400" size={18} />
              <textarea
                placeholder="أي تفاصيل إضافية حول طلبك..."
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 outline-none font-medium text-base h-28 resize-none"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="bg-[#25D366]/5 p-4 rounded-2xl border border-[#25D366]/15">
            {discountAmount > 0 && (
              <div className="flex justify-between items-center text-green-600 font-bold text-sm mb-2">
                <span>خصم مطبّق:</span>
                <span>- {discountAmount.toLocaleString()} د.ج</span>
              </div>
            )}
            <div className="flex justify-between items-center text-gray-900">
              <span className="font-bold text-sm">المجموع الإجمالي:</span>
              <span className="text-2xl font-black text-[#25D366]">{productPrice.toLocaleString()} د.ج</span>
            </div>
          </div>

          <div className="space-y-3">
            {onAddToCart && (
              <button
                type="button"
                onClick={() => {
                  if (validateSelections()) {
                    onAddToCart();
                  }
                }}
                className="w-full bg-white border-2 border-primary text-primary py-3.5 rounded-xl font-bold text-base hover:bg-primary/5 active:scale-95 transition-all flex items-center justify-center gap-2"
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                <ShoppingCart size={20} />
                أضف إلى السلة
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#25D366] text-white rounded-2xl py-5 font-black text-xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed select-none"
              style={{ WebkitTapHighlightColor: "transparent", minHeight: "64px" }}
            >
            {(isLoading || isPdfGenerating) ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin" size={26} />
                <span className="text-[10px] font-black opacity-70">
                  {isPdfGenerating ? "جاري تجهيز وصل الطلب (PDF)..." : "جاري المعالجة..."}
                </span>
              </div>
            ) : (
              <>
                <MessageCircle size={24} />
                <span>تأكيد الطلب عبر واتساب</span>
              </>
            )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
