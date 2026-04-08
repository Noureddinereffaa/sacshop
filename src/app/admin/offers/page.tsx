"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus, Trash2, Edit2, X, Save, Loader2, CheckCircle2,
  Crown, Percent, DollarSign, Clock, Users, Tag, ToggleLeft, ToggleRight
} from "lucide-react";

interface VipOffer {
  id: string;
  title: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_orders: number;
  min_spent: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string | null;
  max_uses: number | null;
  uses_count: number;
}

const EMPTY_OFFER: Omit<VipOffer, "id" | "uses_count"> = {
  title: "",
  description: "",
  discount_type: "percentage",
  discount_value: 10,
  min_orders: 2,
  min_spent: 0,
  is_active: true,
  starts_at: new Date().toISOString().split("T")[0],
  expires_at: null,
  max_uses: null,
};

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<VipOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Partial<VipOffer>>(EMPTY_OFFER);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => { fetchOffers(); }, []);

  async function fetchOffers() {
    setIsLoading(true);
    if (!supabase) { setIsLoading(false); return; }
    const { data } = await supabase.from("vip_offers").select("*").order("created_at", { ascending: false });
    setOffers(data || []);
    setIsLoading(false);
  }

  async function saveOffer() {
    if (!supabase || !editingOffer.title) return;
    setIsSaving(true);
    try {
      if (isEditMode && editingOffer.id) {
        const { id, uses_count, ...rest } = editingOffer as VipOffer;
        await supabase.from("vip_offers").update(rest).eq("id", id);
      } else {
        const { id, uses_count, ...rest } = editingOffer as VipOffer;
        await supabase.from("vip_offers").insert([rest]);
      }
      setSaveSuccess(true);
      setTimeout(() => { setSaveSuccess(false); setIsModalOpen(false); fetchOffers(); }, 1500);
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    if (!supabase) return;
    await supabase.from("vip_offers").update({ is_active: !current }).eq("id", id);
    fetchOffers();
  }

  async function deleteOffer(id: string) {
    if (!supabase || !confirm("هل أنت متأكد من حذف هذا العرض؟")) return;
    await supabase.from("vip_offers").delete().eq("id", id);
    fetchOffers();
  }

  function openCreate() {
    setEditingOffer({ ...EMPTY_OFFER });
    setIsEditMode(false);
    setIsModalOpen(true);
  }

  function openEdit(offer: VipOffer) {
    setEditingOffer({ ...offer });
    setIsEditMode(true);
    setIsModalOpen(true);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Crown className="text-yellow-500" size={32} />
            عروض الزبائن الدائمين
          </h1>
          <p className="text-gray-500 mt-1">عروض حصرية تُعرض تلقائياً للزبائن الذين استوفوا الشروط</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus size={20} />
          إنشاء عرض جديد
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 flex gap-4">
        <Crown className="text-yellow-500 shrink-0 mt-0.5" size={22} />
        <div>
          <h3 className="font-black text-yellow-800 mb-1">كيف يعمل النظام؟</h3>
          <p className="text-yellow-700 text-sm leading-relaxed">
            عند إدخال العميل لرقم هاتفه في صفحة المنتج، يتحقق النظام تلقائياً إذا كان زبوناً دائماً ويستوفي شروط العرض.
            إذا كان مؤهلاً، يظهر له بنر خاص بالعرض الحصري مع تطبيق الخصم تلقائياً على السعر الإجمالي.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي العروض", value: offers.length, icon: Tag, color: "text-blue-500" },
          { label: "عروض نشطة", value: offers.filter(o => o.is_active).length, icon: CheckCircle2, color: "text-green-500" },
          { label: "إجمالي الاستخدامات", value: offers.reduce((a, o) => a + o.uses_count, 0), icon: Users, color: "text-purple-500" },
          { label: "عروض منتهية", value: offers.filter(o => o.expires_at && new Date(o.expires_at) < new Date()).length, icon: Clock, color: "text-red-500" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center ${s.color}`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold">{s.label}</p>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 text-gray-400">
            <Crown size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">لا توجد عروض بعد</p>
            <p className="text-sm">أنشئ أول عرض حصري لزبائنك الكرام</p>
          </div>
        ) : (
          offers.map(offer => {
            const isExpired = offer.expires_at && new Date(offer.expires_at) < new Date();
            return (
              <div
                key={offer.id}
                className={`bg-white rounded-2xl border p-6 flex flex-col md:flex-row gap-4 justify-between transition-all ${
                  offer.is_active && !isExpired
                    ? "border-primary/20 shadow-lg shadow-primary/5"
                    : "border-gray-100 opacity-60"
                }`}
              >
                <div className="flex gap-4 items-start">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    offer.discount_type === "percentage" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                  }`}>
                    {offer.discount_type === "percentage" ? <Percent size={24} /> : <DollarSign size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-gray-900 text-lg">{offer.title}</h3>
                      {offer.is_active && !isExpired && (
                        <span className="text-[10px] bg-green-100 text-green-600 font-black px-2 py-0.5 rounded-full uppercase">نشط</span>
                      )}
                      {isExpired && (
                        <span className="text-[10px] bg-red-100 text-red-500 font-black px-2 py-0.5 rounded-full uppercase">منتهي</span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mb-3">{offer.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-500">
                      <span className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                        <Percent size={12} />
                        خصم: {offer.discount_value}{offer.discount_type === "percentage" ? "%" : " د.ج"}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                        <Users size={12} />
                        الحد الأدنى للطلبات: {offer.min_orders}
                      </span>
                      {offer.max_uses && (
                        <span className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                          <Tag size={12} />
                          الاستخدام: {offer.uses_count}/{offer.max_uses}
                        </span>
                      )}
                      {offer.expires_at && (
                        <span className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                          <Clock size={12} />
                          ينتهي: {new Date(offer.expires_at).toLocaleDateString("ar-DZ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(offer.id, offer.is_active)}
                    className={`p-2 rounded-lg transition-colors ${offer.is_active ? "text-green-500 bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                    title={offer.is_active ? "إيقاف" : "تفعيل"}
                  >
                    {offer.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button onClick={() => openEdit(offer)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteOffer(offer.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-8 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-black text-gray-900">
                {isEditMode ? "تعديل العرض" : "إنشاء عرض حصري جديد"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-5">
              {saveSuccess && (
                <div className="bg-green-50 text-green-600 p-4 rounded-xl flex items-center gap-2 font-bold">
                  <CheckCircle2 size={20} /> تم الحفظ بنجاح!
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700">عنوان العرض *</label>
                <input
                  type="text"
                  value={editingOffer.title || ""}
                  onChange={e => setEditingOffer(o => ({ ...o, title: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="مثال: عرض رمضان الحصري"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700">رسالة للزبون</label>
                <textarea
                  value={editingOffer.description || ""}
                  onChange={e => setEditingOffer(o => ({ ...o, description: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none"
                  placeholder="مرحباً بك من جديد! استمتع بخصم حصري..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">نوع الخصم</label>
                  <select
                    value={editingOffer.discount_type || "percentage"}
                    onChange={e => setEditingOffer(o => ({ ...o, discount_type: e.target.value as "percentage" | "fixed" }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت (د.ج)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">
                    قيمة الخصم {editingOffer.discount_type === "percentage" ? "(%)" : "(د.ج)"}
                  </label>
                  <input
                    type="number"
                    value={editingOffer.discount_value || ""}
                    onChange={e => setEditingOffer(o => ({ ...o, discount_value: Number(e.target.value) }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none font-black"
                    placeholder="10"
                    min="1"
                    max={editingOffer.discount_type === "percentage" ? "100" : undefined}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">الحد الأدنى للطلبات السابقة</label>
                  <input
                    type="number"
                    value={editingOffer.min_orders || ""}
                    onChange={e => setEditingOffer(o => ({ ...o, min_orders: Number(e.target.value) }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="2"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">أقصى عدد استخدامات (اختياري)</label>
                  <input
                    type="number"
                    value={editingOffer.max_uses || ""}
                    onChange={e => setEditingOffer(o => ({ ...o, max_uses: Number(e.target.value) || null }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="غير محدود"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">تاريخ البداية</label>
                  <input
                    type="date"
                    value={editingOffer.starts_at ? String(editingOffer.starts_at).split("T")[0] : ""}
                    onChange={e => setEditingOffer(o => ({ ...o, starts_at: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">تاريخ الانتهاء (اختياري)</label>
                  <input
                    type="date"
                    value={editingOffer.expires_at ? String(editingOffer.expires_at).split("T")[0] : ""}
                    onChange={e => setEditingOffer(o => ({ ...o, expires_at: e.target.value || null }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <div
                  onClick={() => setEditingOffer(o => ({ ...o, is_active: !o.is_active }))}
                  className={`w-12 h-6 rounded-full transition-colors ${editingOffer.is_active ? "bg-primary" : "bg-gray-200"} relative`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${editingOffer.is_active ? "left-7" : "left-1"}`} />
                </div>
                <span className="font-bold text-gray-700">العرض نشط</span>
              </label>

              <button
                onClick={saveOffer}
                disabled={isSaving || !editingOffer.title}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
                {isSaving ? "جاري الحفظ..." : isEditMode ? "حفظ التعديلات" : "إنشاء العرض"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
