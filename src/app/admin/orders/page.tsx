"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  AlertTriangle, 
  PhoneCall,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_address: string;
  total_price: number;
  status: string;
  is_fake: boolean;
  is_duplicate: boolean;
  created_at: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setIsLoading(true);
    if (!supabase) {
      setIsLoading(false);
      return;
    }
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setOrders(data);
    setIsLoading(false);
  }

  const updateStatus = async (order: Order, status: string) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", order.id);
    
    if (!error) {
      if (order.customer_email) {
        try {
          await fetch('/api/notify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: order.id,
              orderNumber: order.order_number,
              customerName: order.customer_name,
              customerEmail: order.customer_email,
              status: status,
              totalPrice: order.total_price,
            })
          });
        } catch (e) {
           console.error("Failed to notify", e);
        }
      }
      fetchOrders();
    }
  };

  const markAs = async (id: string, field: "is_fake" | "is_duplicate", value: boolean) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("orders")
      .update({ [field]: value })
      .eq("id", id);
    
    if (!error) fetchOrders();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-600";
      case "processing": return "bg-orange-100 text-orange-600";
      case "shipped": return "bg-purple-100 text-purple-600";
      case "delivered": return "bg-green-100 text-green-600";
      case "cancelled": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-black text-gray-900">إدارة الطلبات</h1>
           <p className="text-gray-500">متابعة وتأكيد طلبات العملاء من جميع الولايات</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-white border border-gray-200 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-all text-gray-700">
              <Filter size={18} />
              <span>تصفية</span>
           </button>
           <button className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              إضافة طلب يدوي
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { name: "طلبات جديدة", count: orders.filter(o => o.status === 'new').length, icon: Clock, color: "text-blue-500", bg: "bg-blue-50" },
           { name: "تم التسليم", count: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: "text-green-500", bg: "bg-green-50" },
           { name: "ملغاة", count: orders.filter(o => o.status === 'cancelled').length, icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
           { name: "إجمالي الأرباح", count: orders.reduce((acc, o) => acc + (o.status === 'delivered' ? o.total_price : 0), 0) + " د.ج", icon: AlertTriangle, color: "text-purple-500", bg: "bg-purple-50" },
         ].map((stat) => (
           <div key={stat.name} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                 <p className="text-gray-500 text-sm font-bold mb-1">{stat.name}</p>
                 <h4 className="text-2xl font-black text-gray-900">{stat.count}</h4>
              </div>
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                 <stat.icon size={24} />
              </div>
           </div>
         ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="البحث برقم الهاتف أو الاسم..."
                className="w-full bg-gray-50 border-none rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 transition-all"
              />
           </div>
           <p className="text-gray-400 text-sm font-bold flex items-center gap-2">
              عرض {orders.length} طلب
           </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-black uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-5">رقم الطلب</th>
                <th className="px-6 py-5">العميل</th>
                <th className="px-6 py-5">التاريخ</th>
                <th className="px-6 py-5">الإجمالي</th>
                <th className="px-6 py-5">الحالة</th>
                <th className="px-6 py-5 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr>
                   <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold">جاري تحميل الطلبات...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                   <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold">لا يوجد طلبات في الوقت الحالي</td>
                </tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 font-black text-gray-950">#{order.order_number}</td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900">{order.customer_name}</span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <PhoneCall size={12} className="text-primary" />
                        {order.customer_phone}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-gray-500 font-medium">
                    {new Date(order.created_at).toLocaleDateString('ar-DZ')}
                  </td>
                  <td className="px-6 py-5 font-black text-primary">{order.total_price} د.ج</td>
                  <td className="px-6 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                      {order.status === 'new' ? 'جديد' : order.status === 'delivered' ? 'تم التسليم' : order.status}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2 justify-end">
                       {order.is_fake && (
                         <div className="px-3 py-1 bg-red-50 text-red-500 text-[10px] font-bold rounded-lg border border-red-100 flex items-center gap-1">
                            <AlertTriangle size={12} />
                            وهمي
                         </div>
                       )}
                       <button onClick={() => updateStatus(order, 'delivered')} className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors" title="تم التسليم"><CheckCircle size={20} /></button>
                       <button onClick={() => updateStatus(order, 'cancelled')} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="إلغاء الطلب"><XCircle size={20} /></button>
                       <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"><MoreHorizontal size={20} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
