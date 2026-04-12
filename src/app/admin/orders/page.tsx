"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, Filter, Eye, CheckCircle2, 
  XCircle, Trash2, AlertTriangle, PhoneCall,
  Clock, Package, Truck, MessageCircle, X, ChevronDown, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STATUS_MAP: Record<string, { label: string; color: string; icon: any; nextStatus?: string }> = {
  new:        { label: "جديد",         color: "bg-blue-100 text-blue-700", icon: Clock, nextStatus: "confirmed" },
  confirmed:  { label: "مؤكد",         color: "bg-indigo-100 text-indigo-700", icon: CheckCircle2, nextStatus: "processing" },
  processing: { label: "قيد التجهيز",  color: "bg-orange-100 text-orange-700", icon: Package, nextStatus: "shipped" },
  shipped:    { label: "تم الشحن",     color: "bg-purple-100 text-purple-700", icon: Truck, nextStatus: "delivered" },
  delivered:  { label: "مكتمل",        color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelled:  { label: "ملغى",         color: "bg-red-100 text-red-700", icon: XCircle },
};

interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  product_id?: string;
  quantity?: number;
  size?: string;
  color?: string;
  product_price: number;
  total_price: number;
  status: string;
  is_fake: boolean;
  is_duplicate: boolean;
  created_at: string;
  cart_items?: any[];
  admin_notes?: string;
  metadata?: {
    num_colors?: number;
    is_double_sided?: boolean;
    custom_variants?: Record<string, string>;
  };
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);
  const [confirmData, setConfirmData] = useState({ quantity: '', finalPrice: '', notes: '' });
  const [isConfirming, setIsConfirming] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (message: string, type: 'success'|'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  async function fetchOrders() {
    setIsLoading(true);
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setOrders(data);
    setIsLoading(false);
  }

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = 
        order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_phone.includes(searchTerm) ||
        order.order_number.toString().includes(searchTerm);
      
      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const updateStatus = async (order: Order, status: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order.id);
    
    if (!error) {
      showToast(`تم تغيير حالة الطلب #${order.order_number} إلى ${STATUS_MAP[status].label}`);
      if (selectedOrder?.id === order.id) setSelectedOrder({ ...selectedOrder, status });
      fetchOrders();
    } else {
      showToast('حدث خطأ أثناء تغيير الحالة', 'error');
    }
  };

  const markAs = async (order: Order, field: "is_fake" | "is_duplicate") => {
    if (!supabase) return;
    const newValue = !order[field];
    const { error } = await supabase
      .from("orders")
      .update({ [field]: newValue })
      .eq("id", order.id);
    
    if (!error) {
      showToast(`تم ${newValue ? 'وضع' : 'إزالة'} علامة ${field === 'is_fake' ? 'وهمي' : 'مكرر'} للطلب #${order.order_number}`);
      if (selectedOrder?.id === order.id) setSelectedOrder({ ...selectedOrder, [field]: newValue });
      fetchOrders();
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("هل أنت متأكد أنك تريد حذف هذا الطلب نهائياً؟")) return;
    if (!supabase) return;
    const { error } = await supabase.from("orders").delete().eq("id", id);
    if (!error) {
      showToast('تم حذف الطلب بنجاح', 'success');
      setSelectedOrder(null);
      fetchOrders();
    }
  };

  const openWhatsApp = (phone: string, orderNumber: number) => {
    const formattedPhone = phone.replace(/\s+/g, '');
    const wsUrl = `https://wa.me/213${formattedPhone.startsWith('0') ? formattedPhone.slice(1) : formattedPhone}?text=مرحباً بك، نتواصل معك بخصوص طلبك رقم ${orderNumber} من SacShop.`;
    window.open(wsUrl, '_blank');
  };

  const confirmOrder = async () => {
    if (!supabase || !selectedOrder) return;
    if (!confirmData.quantity) {
      showToast('يرجى إدخال الكمية على الأقل', 'error');
      return;
    }
    setIsConfirming(true);
    const finalPrice = confirmData.finalPrice ? parseFloat(confirmData.finalPrice) : selectedOrder.total_price;
    const updates: Record<string, unknown> = {
      status: 'confirmed',
      quantity: parseInt(confirmData.quantity),
      total_price: finalPrice,
    };
    if (confirmData.notes) updates.admin_notes = confirmData.notes;

    const { error } = await supabase.from('orders').update(updates).eq('id', selectedOrder.id);

    if (!error) {
      // Update customer stats
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id, total_orders, total_spent')
        .eq('phone', selectedOrder.customer_phone)
        .maybeSingle();

      if (existingCustomer) {
        await supabase.from('customers').update({
          total_orders: (existingCustomer.total_orders || 0) + 1,
          total_spent: (existingCustomer.total_spent || 0) + finalPrice,
          last_order_at: new Date().toISOString(),
        }).eq('id', existingCustomer.id);
      } else {
        await supabase.from('customers').insert({
          name: selectedOrder.customer_name,
          phone: selectedOrder.customer_phone,
          total_orders: 1,
          total_spent: finalPrice,
          last_order_at: new Date().toISOString(),
        });
      }

      showToast(`✅ تم تأكيد الطلب #${selectedOrder.order_number} بنجاح!`);
      setSelectedOrder({ ...selectedOrder, ...updates, status: 'confirmed' } as Order);
      setConfirmData({ quantity: '', finalPrice: '', notes: '' });
      fetchOrders();
    } else {
      showToast('حدث خطأ أثناء تأكيد الطلب', 'error');
    }
    setIsConfirming(false);
  };

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-black text-gray-900">إدارة الطلبات السريعة</h1>
           <p className="text-gray-500">متابعة وتأكيد طلبات العملاء والتحكم في حالات الشحن.</p>
        </div>
        <div className="flex gap-3">
           <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="bg-white border border-gray-200 px-4 py-3 rounded-xl font-bold text-gray-700 outline-none focus:ring-2 focus:ring-primary/20 appearance-none min-w-[140px]"
           >
              <option value="all">كل الحالات</option>
              {Object.entries(STATUS_MAP).map(([val, info]) => (
                <option key={val} value={val}>{info.label}</option>
              ))}
           </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="البحث برقم الهاتف، الاسم، أو رقم الطلب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border-none rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              />
           </div>
           <p className="text-primary bg-primary/5 px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2">
              نتيجة: {filteredOrders.length} طلب
           </p>
        </div>

        <div className="overflow-x-hidden min-h-[400px]">
          <table className="w-full text-right block lg:table">
            <thead className="hidden lg:table-header-group">
              <tr className="bg-gray-50/50 text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-100 block lg:table-row">
                <th className="px-6 py-5 block lg:table-cell">الطلب</th>
                <th className="px-6 py-5 block lg:table-cell">العميل</th>
                <th className="px-6 py-5 block lg:table-cell">تاريخ الطلب</th>
                <th className="px-6 py-5 block lg:table-cell">الإجمالي</th>
                <th className="px-6 py-5 block lg:table-cell">الحالة الحالية</th>
                <th className="px-6 py-5 text-left block lg:table-cell">إجراءات سريعة</th>
              </tr>
            </thead>
            <tbody className="block lg:table-row-group divide-y lg:divide-y-0 lg:divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                   <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold">جاري تحميل أحدث الطلبات...</td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold">لا توجد طلبات تطابق معايير البحث.</td>
                </tr>
              ) : filteredOrders.map((order) => {
                const st = STATUS_MAP[order.status] || STATUS_MAP.new;
                const StatusIcon = st.icon;

                return (
                  <tr key={order.id} className="block lg:table-row hover:bg-primary/5 transition-colors cursor-pointer group bg-white lg:bg-transparent rounded-2xl mb-4 p-4 lg:p-0 shadow-sm border border-gray-100 lg:border-none lg:shadow-none lg:mb-0" onClick={() => setSelectedOrder(order)}>
                    <td className="px-4 py-2 lg:px-6 lg:py-5 font-black text-gray-900 block lg:table-cell flex items-center justify-between lg:justify-start border-b border-gray-50 lg:border-none">
                      <span className="lg:hidden text-xs text-gray-400 font-bold">الطلب</span>
                      <div className="bg-gray-100 w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors text-sm lg:text-base">
                        #{order.order_number}
                      </div>
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-5 block lg:table-cell flex items-center justify-between lg:justify-start border-b border-gray-50 lg:border-none">
                      <span className="lg:hidden text-xs text-gray-400 font-bold">العميل</span>
                      <div className="flex flex-col text-left lg:text-right">
                        <span className="font-bold text-gray-900 text-sm lg:text-base">{order.customer_name}</span>
                        <span className="text-[11px] lg:text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-1 lg:mt-0 justify-end lg:justify-start" dir="ltr">
                          {order.customer_phone} <PhoneCall size={10} className="text-primary hidden lg:block" />
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-5 text-gray-500 font-medium block lg:table-cell flex items-center justify-between lg:justify-start border-b border-gray-50 lg:border-none text-xs lg:text-sm">
                      <span className="lg:hidden text-xs text-gray-400 font-bold">التاريخ</span>
                      {new Date(order.created_at).toLocaleDateString('ar-DZ', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-5 font-black text-gray-900 text-base lg:text-lg block lg:table-cell flex items-center justify-between lg:justify-start border-b border-gray-50 lg:border-none">
                      <span className="lg:hidden text-xs text-gray-400 font-bold">الإجمالي</span>
                      {order.total_price.toLocaleString()} د.ج
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-5 block lg:table-cell flex items-center justify-between lg:justify-start border-b border-gray-50 lg:border-none">
                      <span className="lg:hidden text-xs text-gray-400 font-bold">الحالة</span>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-black shadow-sm ${st.color}`}>
                          <StatusIcon size={14} /> {st.label}
                        </span>
                        {order.is_fake && <span className="inline-block px-2 py-1 bg-red-100 text-red-600 rounded text-[10px] font-bold shadow-sm">وهمي</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 lg:px-6 lg:py-5 block lg:table-cell flex items-center justify-between lg:justify-end lg:text-left mt-2 lg:mt-0">
                      <span className="lg:hidden text-xs text-gray-400 font-bold">الإجراءات</span>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                         {st.nextStatus && (
                            <button 
                              onClick={() => updateStatus(order, st.nextStatus!)} 
                              className="px-4 py-2.5 lg:p-2.5 text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors font-bold text-xs flex items-center gap-1"
                              title={`ترقية الحالة إلى ${STATUS_MAP[st.nextStatus].label}`}
                            >
                              ترقية <ChevronDown size={14} className="rotate-90 hidden lg:block" />
                            </button>
                         )}
                         <button onClick={() => openWhatsApp(order.customer_phone, order.order_number)} className="px-4 py-2.5 lg:p-2.5 text-white bg-[#25D366] hover:bg-[#20b858] rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2" title="مراسلة العميل عبر واتساب">
                            <MessageCircle size={18} />
                            <span className="lg:hidden text-xs font-bold">مراسلة</span>
                         </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-in Drawer for Order Details */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[450px] max-w-[90vw] bg-white shadow-2xl z-50 overflow-y-auto"
              dir="rtl"
            >
              <div className="p-6 md:p-8 flex flex-col h-full">
                {/* Drawer Header */}
                <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                      طلب #{selectedOrder.order_number}
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 border ${STATUS_MAP[selectedOrder.status].color.replace('text', 'border')}`}>
                        {STATUS_MAP[selectedOrder.status].label}
                      </span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">{new Date(selectedOrder.created_at).toLocaleString('ar-DZ')}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 bg-gray-50 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-colors">
                    <X size={20} />
                  </button>
                </div>

                {/* Customer Section */}
                <div className="bg-gray-50 p-5 rounded-2xl mb-6">
                   <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-3">بيانات العميل</p>
                   <div className="flex items-center justify-between mb-2">
                     <p className="font-bold text-gray-900 text-lg">{selectedOrder.customer_name}</p>
                     <button onClick={() => openWhatsApp(selectedOrder.customer_phone, selectedOrder.order_number)} className="text-[#25D366] bg-green-50 p-2 rounded-lg hover:bg-green-100">
                        <MessageCircle size={18} />
                     </button>
                   </div>
                   <p className="text-gray-600 text-sm font-medium flex items-center gap-2 mb-2" dir="ltr">
                     <PhoneCall size={14} className="text-gray-400" /> {selectedOrder.customer_phone}
                   </p>
                   <p className="text-gray-600 text-sm flex items-start gap-2">
                     📍 <span className="leading-relaxed">{selectedOrder.customer_address || "العنوان غير متوفر"}</span>
                   </p>
                   {selectedOrder.admin_notes?.includes("pdf_url:") && (
                     <div className="mt-4 pt-4 border-t border-gray-100">
                        <a 
                          href={selectedOrder.admin_notes.split("pdf_url:")[1].split("\n")[0]} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-2 bg-primary/10 text-primary rounded-xl font-black text-xs hover:bg-primary/20 transition-all"
                        >
                          <Eye size={14} /> عرض وصل الطلب (PDF)
                        </a>
                     </div>
                   )}
                </div>

                {/* Items Section */}
                <div className="mb-8">
                  <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-3">تفاصيل السلة والمشتريات</p>
                  <div className="space-y-4">
                    {selectedOrder.cart_items && selectedOrder.cart_items.length > 0 ? (
                      selectedOrder.cart_items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                          <div className="flex gap-3">
                             <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                               <Package size={18} />
                             </div>
                             <div>
                               <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                               {(item.size || item.color) && (
                                 <p className="text-xs text-gray-500 mt-1 font-medium bg-gray-50 inline-block px-2 py-0.5 rounded-md">
                                   {item.size} {item.color ? `| ${item.color}` : ""}
                                 </p>
                               )}
                             </div>
                          </div>
                          <span className="font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                            ×{item.quantity}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col bg-white border border-gray-100 p-4 rounded-xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                           <div className="flex gap-3">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
                                <Package size={18} />
                              </div>
                              <p className="font-bold text-gray-800 text-sm">طلب مخصص (Simple Order)</p>
                           </div>
                           <span className="font-black text-gray-900 bg-gray-50 px-3 py-1 rounded-lg">
                             ×{selectedOrder.quantity || 1}
                           </span>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10 flex justify-between items-center">
                     <span className="font-bold text-gray-600">الإجمالي الصافي:</span>
                     <span className="font-black text-2xl text-primary">{selectedOrder.total_price.toLocaleString()} د.ج</span>
                  </div>
                </div>

                {/* Specifications Section */}
                {(selectedOrder.size || selectedOrder.color || selectedOrder.metadata) && (
                  <div className="mb-8">
                    <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-3">المواصفات المختارة</p>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedOrder.size && (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="text-[10px] text-gray-400 font-bold mb-1">المقاس</p>
                          <p className="font-black text-gray-900">{selectedOrder.size}</p>
                        </div>
                      )}
                      {selectedOrder.color && (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="text-[10px] text-gray-400 font-bold mb-1">اللون</p>
                          <p className="font-black text-gray-900">{selectedOrder.color}</p>
                        </div>
                      )}
                      {selectedOrder.metadata?.num_colors && (
                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="text-[10px] text-gray-400 font-bold mb-1">ألوان الطباعة</p>
                          <p className="font-black text-gray-900">
                            {selectedOrder.metadata.num_colors} ألوان 
                            {selectedOrder.metadata.is_double_sided ? " (جهتين)" : " (جهة واحدة)"}
                          </p>
                        </div>
                      )}
                      {selectedOrder.metadata?.custom_variants && Object.entries(selectedOrder.metadata.custom_variants).map(([label, value]) => (
                        <div key={label} className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                          <p className="text-[10px] text-gray-400 font-bold mb-1">{label}</p>
                          <p className="font-black text-primary">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Controls Section */}
                <div className="mt-auto pt-6 border-t border-gray-100 space-y-6">
                   <div>
                     <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-3">تحديث حالة الطلب</p>
                     <div className="grid grid-cols-2 gap-2">
                       {Object.keys(STATUS_MAP).map((statusKey) => (
                         <button
                           key={statusKey}
                           onClick={() => updateStatus(selectedOrder, statusKey)}
                           className={`p-3 rounded-xl text-sm font-bold border transition-all ${
                             selectedOrder.status === statusKey 
                             ? `${STATUS_MAP[statusKey].color} ring-2 ring-primary/30` 
                             : "bg-white text-gray-600 hover:bg-gray-50"
                           }`}
                         >
                           {STATUS_MAP[statusKey].label}
                         </button>
                       ))}
                     </div>
                   </div>

                    {/* Admin Confirmation Panel */}
                    {(selectedOrder.status === 'new' || selectedOrder.status === 'confirmed') && (
                      <div className="bg-gradient-to-br from-primary/5 to-indigo-50 border-2 border-primary/20 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="text-primary" size={18} />
                          <p className="text-sm font-black text-primary tracking-wide">لوحة تأكيد الطلب — فريق التأكيد</p>
                        </div>
                        <p className="text-[11px] text-gray-500 font-bold">أدخل التفاصيل النهائية المتفق عليها مع العميل قبل التأكيد الرسمي.</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-600 uppercase tracking-wide">الكمية النهائية *</label>
                            <input type="number" min="1" placeholder="مثال: 500" dir="ltr"
                              value={confirmData.quantity}
                              onChange={e => setConfirmData(p => ({ ...p, quantity: e.target.value }))}
                              className="w-full bg-white border-2 border-primary/20 rounded-xl py-3 px-4 font-black text-gray-900 focus:border-primary outline-none transition-all text-center text-lg"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-black text-gray-600 uppercase tracking-wide">السعر النهائي (د.ج)</label>
                            <input type="number" min="0" placeholder="مثال: 15000" dir="ltr"
                              value={confirmData.finalPrice}
                              onChange={e => setConfirmData(p => ({ ...p, finalPrice: e.target.value }))}
                              className="w-full bg-white border-2 border-primary/20 rounded-xl py-3 px-4 font-black text-gray-900 focus:border-primary outline-none transition-all text-center text-lg"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-black text-gray-600 uppercase tracking-wide">ملاحظات فريق التأكيد</label>
                          <textarea placeholder="مواصفات الطباعة، موعد التسليم، ملاحظات خاصة..." rows={2}
                            value={confirmData.notes}
                            onChange={e => setConfirmData(p => ({ ...p, notes: e.target.value }))}
                            className="w-full bg-white border-2 border-primary/20 rounded-xl py-3 px-4 font-bold text-gray-700 focus:border-primary outline-none transition-all resize-none text-sm"
                          />
                        </div>
                        <button onClick={confirmOrder} disabled={isConfirming}
                          className="w-full bg-primary text-white py-4 rounded-xl font-black text-base flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
                        >
                          {isConfirming ? (
                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                            </svg>
                          ) : <CheckCircle size={20} />}
                          {isConfirming ? 'جاري التأكيد...' : 'تأكيد الطلب وحفظ التفاصيل'}
                        </button>
                      </div>
                    )}

                   <div>
                     <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 mb-3">عناصر الأمان والإنذار (Anti-Fraud)</p>
                     <div className="flex gap-3">
                       <button 
                         onClick={() => markAs(selectedOrder, "is_fake")}
                         className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors border ${
                           selectedOrder.is_fake ? "bg-red-50 text-red-600 border-red-200" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                         }`}
                       >
                         <AlertTriangle size={16} /> طلب وهمي
                       </button>
                       <button 
                         onClick={() => markAs(selectedOrder, "is_duplicate")}
                         className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-colors border ${
                           selectedOrder.is_duplicate ? "bg-orange-50 text-orange-600 border-orange-200" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                         }`}
                       >
                         <XCircle size={16} /> طلب مكرر
                       </button>
                     </div>
                   </div>

                   <button 
                     onClick={() => deleteOrder(selectedOrder.id)}
                     className="w-full flex items-center justify-center gap-2 py-4 bg-white border border-red-200 text-red-500 rounded-xl font-bold hover:bg-red-50 hover:text-red-600 transition-all"
                   >
                     <Trash2 size={18} /> حذف الطلب نهائياً
                   </button>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Modern Toast Notification */}
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
