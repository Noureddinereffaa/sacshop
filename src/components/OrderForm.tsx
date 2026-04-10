"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, User, Loader2, Edit3, MessageCircle, ShoppingCart, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { CartItem } from "@/types";
import { generateAndUploadOrderPDF } from "@/utils/generateOrderPDF";

interface OrderFormProps {
  productId: string;
  productName: string;
  productPrice: number;
  selectedSize?: string;
  selectedColor?: string;
  appliedOfferId?: string;
  cartItems?: CartItem[];
  quantity?: number;
  discountAmount?: number;
  onAddToCart?: () => void;
}

// step: "info" → "password" (for new users) → "success"
type Step = "info" | "password" | "success";

export default function OrderForm({ productId, productName, productPrice, selectedSize, selectedColor, appliedOfferId, cartItems = [], quantity = 1, discountAmount = 0, onAddToCart }: OrderFormProps) {
  const [step, setStep] = useState<Step>("info");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingWaLink, setPendingWaLink] = useState<string>("");
  const [pendingOrderId, setPendingOrderId] = useState<string>("");
  const [whatsappNumber, setWhatsappNumber] = useState<string>("213000000000");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [formData, setFormData] = useState({ name: "", phone: "", notes: "" });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Auto-fill if already logged in
  useEffect(() => {
    const storedPhone = sessionStorage.getItem("sacshop_phone");
    const storedName = sessionStorage.getItem("sacshop_name");
    if (storedPhone && storedName) {
      setFormData(prev => ({ ...prev, phone: storedPhone, name: storedName }));
      setIsLoggedIn(true);
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

  // ─── STEP 1: Validate form and check if user exists ────────────────────────
  const handleInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;
    setIsLoading(true);

    try {
      // If already logged in → skip password step and go directly to order creation
      if (isLoggedIn) {
        await createOrderAndGetWaLink();
        return;
      }

      // Check if user already has an account
      const res = await fetch("/api/check-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone.trim() })
      });
      const { exists } = await res.json();

      if (exists) {
        // Existing user — no password step needed, go directly to order
        await createOrderAndGetWaLink();
      } else {
        // New user — show password step
        setStep("password");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ في التحقق. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  // ─── STEP 2: Create account with password then create order ────────────────
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      alert("كلمة السر يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      alert("كلمتا السر غير متطابقتين");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create Supabase Auth account
      const res = await fetch("/api/setup-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone.trim(), name: formData.name.trim(), password })
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || "فشل إنشاء الحساب");

      // 2. Save session
      sessionStorage.setItem("sacshop_phone", formData.phone.trim());
      sessionStorage.setItem("sacshop_name", formData.name.trim());

      // 3. Create order and build WhatsApp link
      await createOrderAndGetWaLink();
    } catch (err: any) {
      alert("خطأ: " + (err?.message || "فشل إنشاء الحساب. تأكد من البيانات وحاول مرة أخرى."));
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
      delivery_type: "home",
      cart_items: isCartOrder ? cartItems : [],
      admin_notes: formData.notes.trim() || null,
    });
    if (error) throw new Error(error.message);

    // ── Generate PDF and upload to Supabase Storage ───────────────────────────
    // Show loading indicator — PDF generation takes 1-2 seconds
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
      });

      // Also save PDF URL in order record (appending to existing notes if any)
      const { data: currentOrder } = await supabase.from("orders").select("admin_notes").eq("id", orderId).single();
      const updatedNotes = (currentOrder?.admin_notes ? currentOrder.admin_notes + "\n" : "") + `pdf_url:${pdfUrl}`;
      await supabase.from("orders").update({ admin_notes: updatedNotes }).eq("id", orderId);
    } catch (pdfErr) {
      console.warn("PDF generation failed, falling back to text message:", pdfErr);
    }

    // ── Build minimal WhatsApp message (PDF link only) ────────────────────────
    let waMessage: string;
    if (pdfUrl) {
      waMessage = [
        `📦 *طلب جديد من ${formData.name.trim()}*`,
        `📞 رقم الهاتف: ${formData.phone.trim()}`,
        ``,
        `📄 *وصل الطلب (غير قابل للتعديل):*`,
        pdfUrl,
        ``,
        `🔖 رقم الطلب: #${shortId}`,
      ].join("\n");
    } else {
      // Fallback: short reference message
      waMessage = [
        `📦 طلب جديد`,
        `👤 ${formData.name.trim()} \u2014 📞 ${formData.phone.trim()}`,
        `🔖 رقم الطلب: #${shortId}`,
      ].join("\n");
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
    setPendingWaLink(`https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`);
    setStep("success");
  };

  // ─── SUCCESS SCREEN ─────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-3xl border-2 border-[#25D366]/40 shadow-xl text-center space-y-5"
      >
        <div className="w-20 h-20 bg-[#25D366]/15 rounded-full flex items-center justify-center text-[#25D366] mx-auto">
          <CheckCircle2 size={44} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900">تم تسجيل طلبك! ✅</h2>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            اضغط على الزر أدناه لفتح واتساب وإتمام التأكيد مع فريقنا.
          </p>
        </div>
        {pendingWaLink && (
          <a
            href={pendingWaLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white rounded-2xl py-5 font-black text-lg shadow-lg active:scale-95 transition-transform"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            <MessageCircle size={24} />
            فتح واتساب والتأكيد الآن
          </a>
        )}
        <p className="text-xs text-gray-400">
          رقم الطلب: #{pendingOrderId.split("-")[0].toUpperCase()}
        </p>
      </motion.div>
    );
  }

  // ─── STEP 2: PASSWORD SCREEN (new users only) ───────────────────────────────
  if (step === "password") {
    return (
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-100 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-950">أنشئ كلمة سر لحسابك</h2>
            <p className="text-gray-400 font-semibold text-xs">ستستخدمها لمتابعة طلباتك لاحقاً</p>
          </div>
        </div>

        {/* Show summary of selected info */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
            <User size={18} />
          </div>
          <div>
            <p className="font-black text-gray-900 text-sm">{formData.name}</p>
            <p className="font-bold text-gray-500 text-xs" dir="ltr">{formData.phone}</p>
          </div>
          <button
            onClick={() => setStep("info")}
            className="mr-auto text-xs text-primary font-bold hover:underline"
          >
            تعديل
          </button>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 block">كلمة السر *</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="6 أحرف على الأقل"
                className="w-full bg-gray-50 border-none rounded-2xl py-4 pr-12 pl-12 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-black text-gray-700 block">تأكيد كلمة السر *</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                required
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="أعد كتابة كلمة السر"
                className={`w-full bg-gray-50 border-2 rounded-2xl py-4 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-base transition-colors ${
                  confirmPassword && password !== confirmPassword
                    ? "border-red-300 bg-red-50/30"
                    : confirmPassword && password === confirmPassword
                    ? "border-green-300 bg-green-50/30"
                    : "border-transparent"
                }`}
              />
              {confirmPassword && password === confirmPassword && (
                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500" size={18} />
              )}
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 text-xs text-blue-600 font-bold">
            💡 احفظ كلمة السر — ستستخدمها لمتابعة طلباتك وتاريخ مشترياتك
          </div>

          <button
            type="submit"
            disabled={isLoading || password.length < 6 || password !== confirmPassword}
            className="w-full bg-[#25D366] text-white rounded-2xl py-5 font-black text-xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed select-none"
            style={{ WebkitTapHighlightColor: "transparent", minHeight: "64px" }}
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={26} />
            ) : (
              <>
                <MessageCircle size={24} />
                <span>إنشاء حساب وتأكيد الطلب</span>
              </>
            )}
          </button>
        </form>
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
                  disabled={isLoggedIn}
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
                  disabled={isLoggedIn}
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
                onClick={onAddToCart}
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
              {isLoading ? (
                <Loader2 className="animate-spin" size={26} />
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
