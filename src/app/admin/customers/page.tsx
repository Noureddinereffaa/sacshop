"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, Users, Crown, ShoppingBag, MapPin, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Customer {
  id: string;
  name: string;
  phone: string;
  is_vip: boolean;
  total_orders: number;
  total_spent: number;
  created_at: string;
  last_order_at: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeletingBulk, setIsDeletingBulk] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showToast = (message: string, type: 'success'|'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function fetchCustomers() {
      if (!supabase) { setIsLoading(false); return; }
      const { data } = await supabase
        .from("customers")
        .select("*")
        .order("last_order_at", { ascending: false });
      
      setCustomers(data || []);
      setIsLoading(false);
    }
    fetchCustomers();
  }, []);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  async function fetchCustomers() {
    if (!supabase) { setIsLoading(false); return; }
    const { data } = await supabase
      .from("customers")
      .select("*")
      .order("last_order_at", { ascending: false });
    
    setCustomers(data || []);
  }

  const deleteBulkCustomers = async () => {
    if (!selectedIds.length) return;
    if (!confirm(`هل أنت متأكد أنك تريد حذف ${selectedIds.length} زبائن نهائياً؟ سيتم حذف بياناتهم فقط، ولن تتأثر الطلبات المرتبطة بهم.`)) return;
    
    setIsDeletingBulk(true);
    if (!supabase) return;
    
    const { error } = await supabase
      .from("customers")
      .delete()
      .in("id", selectedIds);
    
    if (!error) {
      showToast(`تم حذف ${selectedIds.length} زبائن بنجاح`, 'success');
      setSelectedIds([]);
      fetchCustomers();
    } else {
      showToast('حدث خطأ أثناء الحذف الجماعي', 'error');
    }
    setIsDeletingBulk(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(c => c.id));
    }
  };

  const toggleSelectCustomer = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center p-2 mb-2 backdrop-blur-sm">
              <Users size={28} className="text-white" />
            </div>
          </h1>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">إدارة الزبائن</h1>
          <p className="text-indigo-200 font-medium">سجل شامل لجميع عملاء المتجر، مع تحليلات إنفاقهم.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: "إجمالي الزبائن", value: customers.length, color: "bg-blue-50 text-blue-600 border-blue-100", icon: Users },
          { label: "زبائن الـ VIP", value: customers.filter(c => c.is_vip).length, color: "bg-yellow-50 text-yellow-600 border-yellow-200", icon: Crown },
          { label: "الطلبات لكل زبون", value: customers.length > 0 ? (customers.reduce((a, c) => a + c.total_orders, 0) / customers.length).toFixed(1) : "0", color: "bg-green-50 text-green-600 border-green-200", icon: ShoppingBag },
          { label: "أعلى إنفاق للزبون", value: customers.length > 0 ? `${Math.max(...customers.map(c => c.total_spent)).toLocaleString()} د.ج` : "0 د.ج", color: "bg-purple-50 text-purple-600 border-purple-200", icon: MapPin },
        ].map((s, idx) => (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * idx }} key={s.label}>
            <div className={`rounded-3xl p-6 border shadow-sm ${s.color}`}>
              <s.icon size={24} className="mb-4 opacity-80" />
              <p className="text-black/50 text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-2xl font-black">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 outline-none font-medium text-sm"
          />
        </div>
        {selectedIds.length > 0 && (
          <motion.button 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={deleteBulkCustomers}
            disabled={isDeletingBulk}
            className="bg-red-50 text-red-600 px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 border border-red-100 hover:bg-red-100 transition-all disabled:opacity-50 whitespace-nowrap w-full md:w-auto justify-center"
          >
            <Trash2 size={18} />
            حذف المحدد ({selectedIds.length})
          </motion.button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold">لا توجد نتائج</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                  <th className="px-6 py-5 w-10">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={selectedIds.length === filtered.length && filtered.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-5 text-right">الزبون</th>
                  <th className="px-6 py-5 text-right">رقم الهاتف</th>
                  <th className="px-6 py-5 text-right">المشتريات</th>
                  <th className="px-6 py-5 text-right">الإنفاق الإجمالي</th>
                  <th className="px-6 py-5 text-right">تاريخ آخر طلب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(customer => (
                  <tr key={customer.id} className={`hover:bg-gray-50/50 transition-colors group cursor-pointer ${selectedIds.includes(customer.id) ? 'bg-primary/5' : ''}`} onClick={(e) => toggleSelectCustomer(customer.id, e as any)}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                        checked={selectedIds.includes(customer.id)}
                        onChange={(e) => e.stopPropagation()} 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black ${
                          customer.is_vip ? "bg-yellow-100 text-yellow-600" : "bg-gray-100 text-gray-600"
                        }`}>
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-1.5">
                            {customer.name}
                            {customer.is_vip && <Crown size={14} className="text-yellow-500" />}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 px-3 py-1 font-mono text-xs rounded-lg text-gray-700" dir="ltr">
                        {customer.phone}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 font-bold text-gray-700">
                        <ShoppingBag size={14} className="text-gray-400" />
                        {customer.total_orders}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="bg-primary/5 px-4 py-2 rounded-xl border border-primary/10 inline-block">
                        <p className="font-black text-primary text-base">{customer.total_spent.toLocaleString()} د.ج</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">
                      {new Date(customer.last_order_at || customer.created_at).toLocaleDateString("ar-DZ", {
                        year: "numeric", month: "short", day: "numeric"
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-sm border-2 ${
              toast.type === 'success' 
              ? 'bg-white border-green-200 text-gray-800' 
              : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {toast.type === 'success' ? (
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={16} />
              </div>
            ) : (
              <div className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center">
                <AlertTriangle size={16} />
              </div>
            )}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
