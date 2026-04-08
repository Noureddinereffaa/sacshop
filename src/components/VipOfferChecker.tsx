"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Crown, Loader2, Tag, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VipOffer {
  id: string;
  title: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
}

interface VipOfferCheckerProps {
  productPrice: number;
  onOfferApplied: (offer: VipOffer, finalPrice: number) => void;
  onOfferRemoved: () => void;
}

export default function VipOfferChecker({ productPrice, onOfferApplied, onOfferRemoved }: VipOfferCheckerProps) {
  const [phone, setPhone] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [offer, setOffer] = useState<VipOffer | null>(null);
  const [checked, setChecked] = useState(false);
  const [notVip, setNotVip] = useState(false);

  async function checkVip() {
    if (!phone.trim() || !supabase) return;
    setIsChecking(true);
    setChecked(false);
    setNotVip(false);
    setOffer(null);
    onOfferRemoved();

    try {
      // 1. Check if customer exists and is VIP
      const { data: customer } = await supabase
        .from("customers")
        .select("id, is_vip, total_orders")
        .eq("phone", phone.trim())
        .single();

      if (!customer) {
        setNotVip(false);
        setChecked(true);
        return;
      }

      // 2. Find applicable active VIP offer
      const { data: offers } = await supabase
        .from("vip_offers")
        .select("*")
        .eq("is_active", true)
        .lte("min_orders", customer.total_orders)
        .or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`)
        .order("discount_value", { ascending: false })
        .limit(1);

      if (offers && offers.length > 0) {
        const foundOffer = offers[0] as VipOffer;
        setOffer(foundOffer);
        const discounted =
          foundOffer.discount_type === "percentage"
            ? productPrice * (1 - foundOffer.discount_value / 100)
            : productPrice - foundOffer.discount_value;
        onOfferApplied(foundOffer, Math.max(0, discounted));
      } else {
        setNotVip(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsChecking(false);
      setChecked(true);
    }
  }

  function removeOffer() {
    setOffer(null);
    setChecked(false);
    setNotVip(false);
    setPhone("");
    onOfferRemoved();
  }

  if (!supabase) return null;

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {!offer ? (
          <motion.div
            key="checker"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-l from-yellow-50 to-amber-50 border border-yellow-200/80 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Crown size={18} className="text-yellow-600" />
              <p className="font-black text-yellow-800 text-sm">هل أنت زبون دائم؟</p>
            </div>
            <p className="text-yellow-700 text-xs mb-3 leading-relaxed">
              أدخل رقم هاتفك للتحقق من العروض الحصرية المتاحة لك
            </p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-500" />
                <input
                  type="tel"
                  dir="ltr"
                  placeholder="0X XX XX XX XX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && checkVip()}
                  className="w-full bg-white border border-yellow-200 rounded-xl py-2.5 pr-9 pl-3 focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 outline-none text-sm font-bold text-right"
                />
              </div>
              <button
                onClick={checkVip}
                disabled={isChecking || !phone.trim()}
                className="bg-yellow-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-yellow-600 transition-all disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap"
              >
                {isChecking ? <Loader2 size={14} className="animate-spin" /> : <Tag size={14} />}
                تحقق
              </button>
            </div>
            {checked && notVip && (
              <p className="text-yellow-700 text-xs mt-2 font-bold">
                لا توجد عروض حصرية لهذا الرقم حالياً. أكمل طلباتك لتصبح زبوناً مميزاً!
              </p>
            )}
            {checked && !notVip && !offer && phone && (
              <p className="text-yellow-700 text-xs mt-2 font-bold">
                رقم جديد — أتمنى لك طلباً رائعاً! 🎉
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="offer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-l from-primary/10 to-teal-50 border-2 border-primary/30 rounded-2xl p-5 relative overflow-hidden"
          >
            {/* Decorative */}
            <div className="absolute -top-8 -left-8 w-32 h-32 bg-primary/5 rounded-full" />
            <div className="flex items-start gap-3 relative">
              <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center shrink-0">
                <Crown size={22} className="text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-primary text-white font-black px-2 py-0.5 rounded-full">زبون مميز ⭐</span>
                </div>
                <h4 className="font-black text-gray-900 text-lg">{offer.title}</h4>
                <p className="text-gray-600 text-sm mt-1">{offer.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="bg-primary/10 text-primary font-black px-4 py-1.5 rounded-full text-lg">
                    -{offer.discount_value}{offer.discount_type === "percentage" ? "%" : " د.ج"}
                  </span>
                  <span className="text-gray-500 text-xs font-bold">تم تطبيق الخصم تلقائياً</span>
                </div>
              </div>
              <button onClick={removeOffer} className="text-gray-300 hover:text-gray-500 p-1 rounded-lg transition-colors text-xs">
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
