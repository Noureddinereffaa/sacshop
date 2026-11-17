"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus, Trash2, Edit2, X, Save, Loader2, CheckCircle2,
  Ticket, Percent, DollarSign, Clock, Tag, ToggleLeft, ToggleRight, Package, Store, AlertCircle
} from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_total: number;
  max_discount_amount: number | null;
  scope: "store" | "products";
  starts_at: string;
  expires_at: string | null;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean;
  product_ids: string[];
}

interface ProductOption {
  id: string;
  name: string;
}

const EMPTY_COUPON: Omit<Coupon, "id" | "uses_count" | "product_ids"> & { product_ids: string[] } = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: 10,
  min_order_total: 0,
  max_discount_amount: null,
  scope: "store",
  starts_at: new Date().toISOString().split("T")[0],
  expires_at: null,
  max_uses: null,
  is_active: true,
  product_ids: [],
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon>>(EMPTY_COUPON);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    fetchCoupons();
    fetchProducts();
  }, []);

  async function fetchCoupons() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching coupons:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchProducts() {
    const { data } = await supabase.from("products").select("id, name").order("name");
    setProducts(Array.isArray(data) ? data : []);
  }

  async function saveCoupon() {
    if (!editingCoupon.code?.trim()) return;
    setIsSaving(true);
    setSaveError("");
    try {
      const method = isEditMode && editingCoupon.id ? "PATCH" : "POST";
      const url = isEditMode && editingCoupon.id ? `/api/coupons/${editingCoupon.id}` : "/api/coupons";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingCoupon),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || "حدث خطأ أثناء الحفظ");
        return;
      }
      setSaveSuccess(true);
      setTimeout(() => { setSaveSuccess(false); setIsModalOpen(false); fetchCoupons(); }, 1200);
    } catch (err) {
      console.error("Unexpected error saving coupon:", err);
      setSaveError("حدث خطأ غير متوقع");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleActive(coupon: Coupon) {
    await fetch(`/api/coupons/${coupon.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !coupon.is_active }),
    });
    fetchCoupons();
  }

  async function deleteCoupon(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;
    await fetch(`/api/coupons/${id}`, { method: "DELETE" });
    fetchCoupons();
  }

  function openCreate() {
    setEditingCoupon({ ...EMPTY_COUPON });
    setIsEditMode(false);
    setSaveError("");
    setIsModalOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setEditingCoupon({
      ...coupon,
      starts_at: coupon.starts_at ? String(coupon.starts_at).split("T")[0] : "",
    });
    setIsEditMode(true);
    setSaveError("");
    setIsModalOpen(true);
  }

  function toggleProduct(productId: string) {
    setEditingCoupon(c => {
      const current = c.product_ids || [];
      return {
        ...c,
        product_ids: current.includes(productId)
          ? current.filter(id => id !== productId)
          : [...current, productId],
      };
    });
  }

  const stats = useMemo(() => [
    { label: "إجمالي الكوبونات", value: coupons.length, icon: Ticket, color: "text-blue-500" },
    { label: "كوبونات نشطة", value: coupons.filter(c => c.is_active).length, icon: CheckCircle2, color: "text-green-500" },
    { label: "إجمالي الاستخدامات", value: coupons.reduce((a, c) => a + c.uses_count, 0), icon: Tag, color: "text-purple-500" },
    { label: "كوبونات منتهية", value: coupons.filter(c => c.expires_at && new Date(c.expires_at) < new Date()).length, icon: Clock, color: "text-red-500" },
  ], [coupons]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Ticket className="text-primary" size={32} />
            كوبونات الخصم
          </h1>
          <p className="text-gray-500 mt-1">أكواد خصم يُدخلها الزبون عند إتمام الطلب</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus size={20} />
          إنشاء كوبون جديد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
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

      {/* Coupons List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-gray-100">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 text-gray-400">
            <Ticket size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">لا توجد كوبونات بعد</p>
            <p className="text-sm">أنشئ أول كوبون خصم لزبائنك</p>
          </div>
        ) : (
          coupons.map(coupon => {
            const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
            const isUsedUp = coupon.max_uses !== null && coupon.uses_count >= coupon.max_uses;
            const isActive = coupon.is_active && !isExpired && !isUsedUp;
            return (
              <div
                key={coupon.id}
                className={`bg-white rounded-2xl border p-6 flex flex-col md:flex-row gap-4 justify-between transition-all ${
                  isActive ? "border-primary/20 shadow-lg shadow-primary/5" : "border-gray-100 opacity-60"
                }`}
              >
                <div className="flex gap-4 items-start">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                    coupon.discount_type === "percentage" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                  }`}>
                    {coupon.discount_type === "percentage" ? <Percent size={24} /> : <DollarSign size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-gray-900 text-lg font-mono tracking-wider">{coupon.code}</h3>
                      {isActive && (
                        <span className="text-[10px] bg-green-100 text-green-600 font-black px-2 py-0.5 rounded-full uppercase">نشط</span>
                      )}
                      {isExpired && (
                        <span className="text-[10px] bg-red-100 text-red-500 font-black px-2 py-0.5 rounded-full uppercase">منتهي</span>
                      )}
                      {isUsedUp && !isExpired && (
                        <span className="text-[10px] bg-orange-100 text-orange-600 font-black px-2 py-0.5 rounded-full uppercase">استُنفد</span>
                      )}
                      {!coupon.is_active && (
                        <span className="text-[10px] bg-gray-100 text-gray-500 font-black px-2 py-0.5 rounded-full uppercase">معطل</span>
                      )}
                    </div>
                    {coupon.description && <p className="text-gray-500 text-sm mb-3">{coupon.description}</p>}
                    <div className="flex flex-wrap gap-3 text-xs font-bold text-gray-500">
                      <span className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                        <Percent size={12} />
                        خصم: {coupon.discount_value}{coupon.discount_type === "percentage" ? "%" : " د.ج"}
                      </span>
                      <span className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                        {coupon.scope === "store" ? <Store size={12} /> : <Package size={12} />}
                        {coupon.scope === "store" ? "كل المتجر" : `${coupon.product_ids.length} منتج`}
                      </span>
                      {coupon.min_order_total > 0 && (
                        <span className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-full">
                          حد أدنى: {coupon.min_order_total} د.ج
                        </span>
                      )}
                      {coupon.max_uses !== null && (
                        <span className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                          <Tag size={12} />
                          الاستخدام: {coupon.uses_count}/{coupon.max_uses}
                        </span>
                      )}
                      {coupon.expires_at && (
                        <span className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 rounded-full">
                          <Clock size={12} />
                          ينتهي: {new Date(coupon.expires_at).toLocaleDateString("ar-DZ")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggleActive(coupon)}
                    className={`p-2 rounded-lg transition-colors ${coupon.is_active ? "text-green-500 bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                    title={coupon.is_active ? "إيقاف" : "تفعيل"}
                  >
                    {coupon.is_active ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <button onClick={() => openEdit(coupon)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => deleteCoupon(coupon.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
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
                {isEditMode ? "تعديل الكوبون" : "إنشاء كوبون جديد"}
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
              {saveError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 font-bold">
                  <AlertCircle size={20} /> {saveError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">كود الكوبون *</label>
                  <input
                    type="text"
                    value={editingCoupon.code || ""}
                    onChange={e => setEditingCoupon(c => ({ ...c, code: e.target.value.toUpperCase() }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none font-mono font-black tracking-wider uppercase"
                    placeholder="SAC20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">نوع الخصم</label>
                  <select
                    value={editingCoupon.discount_type || "percentage"}
                    onChange={e => setEditingCoupon(c => ({ ...c, discount_type: e.target.value as "percentage" | "fixed" }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت (د.ج)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">
                    قيمة الخصم {editingCoupon.discount_type === "percentage" ? "(%)" : "(د.ج)"}
                  </label>
                  <input
                    type="number"
                    value={editingCoupon.discount_value || ""}
                    onChange={e => setEditingCoupon(c => ({ ...c, discount_value: Number(e.target.value) }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none font-black"
                    placeholder="10"
                    min="1"
                    max={editingCoupon.discount_type === "percentage" ? "100" : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">
                    سقف الخصم بالدينار {editingCoupon.discount_type === "percentage" ? "(اختياري)" : "(غير متاح)"}
                  </label>
                  <input
                    type="number"
                    value={editingCoupon.max_discount_amount ?? ""}
                    onChange={e => setEditingCoupon(c => ({ ...c, max_discount_amount: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-40"
                    placeholder="بلا حد"
                    min="1"
                    disabled={editingCoupon.discount_type !== "percentage"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">الحد الأدنى للطلب (د.ج)</label>
                  <input
                    type="number"
                    value={editingCoupon.min_order_total || ""}
                    onChange={e => setEditingCoupon(c => ({ ...c, min_order_total: Number(e.target.value) || 0 }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">أقصى عدد استخدامات</label>
                  <input
                    type="number"
                    value={editingCoupon.max_uses ?? ""}
                    onChange={e => setEditingCoupon(c => ({ ...c, max_uses: e.target.value ? Number(e.target.value) : null }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                    placeholder="غير محدود"
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">تاريخ البداية</label>
                  <input
                    type="date"
                    value={editingCoupon.starts_at ? String(editingCoupon.starts_at).split("T")[0] : ""}
                    onChange={e => setEditingCoupon(c => ({ ...c, starts_at: e.target.value }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">تاريخ الانتهاء (اختياري)</label>
                  <input
                    type="date"
                    value={editingCoupon.expires_at ? String(editingCoupon.expires_at).split("T")[0] : ""}
                    onChange={e => setEditingCoupon(c => ({ ...c, expires_at: e.target.value || null }))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700">نطاق الكوبون</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingCoupon(c => ({ ...c, scope: "store" }))}
                    className={`p-4 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${
                      editingCoupon.scope === "store" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <Store size={18} /> كل المتجر
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCoupon(c => ({ ...c, scope: "products" }))}
                    className={`p-4 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition-all ${
                      editingCoupon.scope === "products" ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"
                    }`}
                  >
                    <Package size={18} /> منتجات محددة
                  </button>
                </div>
              </div>

              {editingCoupon.scope === "products" && (
                <div className="space-y-2">
                  <label className="text-sm font-black text-gray-700">
                    المنتجات المشمولة * ({editingCoupon.product_ids?.length || 0} محدد)
                  </label>
                  <div className="max-h-48 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-1">
                    {products.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">لا توجد منتجات</p>
                    ) : (
                      products.map(p => (
                        <label key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white cursor-pointer">
                          <input
                            type="checkbox"
                            checked={(editingCoupon.product_ids || []).includes(p.id)}
                            onChange={() => toggleProduct(p.id)}
                            className="w-4 h-4 accent-[var(--color-primary)]"
                          />
                          <span className="text-sm font-bold text-gray-700">{p.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-black text-gray-700">وصف داخلي (اختياري)</label>
                <input
                  type="text"
                  value={editingCoupon.description || ""}
                  onChange={e => setEditingCoupon(c => ({ ...c, description: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 focus:ring-2 focus:ring-primary/20 outline-none"
                  placeholder="مثال: حملة رمضان على إنستغرام"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2">
                <div
                  onClick={() => setEditingCoupon(c => ({ ...c, is_active: !c.is_active }))}
                  className={`w-12 h-6 rounded-full transition-colors ${editingCoupon.is_active ? "bg-primary" : "bg-gray-200"} relative`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${editingCoupon.is_active ? "left-7" : "left-1"}`} />
                </div>
                <span className="font-bold text-gray-700">الكوبون نشط</span>
              </label>

              <button
                onClick={saveCoupon}
                disabled={isSaving || !editingCoupon.code?.trim()}
                className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
                {isSaving ? "جاري الحفظ..." : isEditMode ? "حفظ التعديلات" : "إنشاء الكوبون"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
