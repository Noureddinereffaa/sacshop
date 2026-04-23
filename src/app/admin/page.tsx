"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Package, TrendingUp, Users, ShoppingBag, Crown, ArrowLeft, Clock, CheckCircle2, Truck, Bell } from "lucide-react";
import { motion } from "framer-motion";

interface Stats {
  totalOrders: number;
  newOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  vipCustomers: number;
}

interface RecentOrder {
  id: string;
  order_number: number;
  customer_name: string;
  customer_phone: string;
  total_price: number;
  status: string;
  created_at: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  new:        { label: "جديد",         color: "bg-blue-100 text-blue-700", icon: Clock },
  confirmed:  { label: "مؤكد",         color: "bg-indigo-100 text-indigo-700", icon: CheckCircle2 },
  processing: { label: "قيد التجهيز",  color: "bg-orange-100 text-orange-700", icon: Package },
  shipped:    { label: "تم الشحن",     color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered:  { label: "مكتمل",        color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelled:  { label: "ملغى",         color: "bg-red-100 text-red-700", icon: Clock },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0, newOrders: 0, deliveredOrders: 0, cancelledOrders: 0,
    totalRevenue: 0, totalProducts: 0, totalCustomers: 0, vipCustomers: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!supabase) { setIsLoading(false); return; }
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase.from("orders").select("*"),
        supabase.from("products").select("id").eq("is_published", true),
        supabase.from("customers").select("id, is_vip"),
      ]);

      if (ordersRes.error) console.error("Admin Dashboard: Error fetching orders:", ordersRes.error);
      if (productsRes.error) console.error("Admin Dashboard: Error fetching products:", productsRes.error);
      if (customersRes.error) console.error("Admin Dashboard: Error fetching customers:", customersRes.error);

      const orders = ordersRes.data || [];
      const activeStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
      const sorted = [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setStats({
        totalOrders: orders.length,
        newOrders: orders.filter(o => o.status === "new").length,
        deliveredOrders: orders.filter(o => o.status === "delivered").length,
        cancelledOrders: orders.filter(o => o.status === "cancelled").length,
        totalRevenue: orders.filter(o => activeStatuses.includes(o.status)).reduce((a, o) => a + (o.total_price || 0), 0),
        totalProducts: productsRes.data?.length || 0,
        totalCustomers: customersRes.data?.length || 0,
        vipCustomers: customersRes.data?.filter(c => c.is_vip).length || 0,
      });
      setRecentOrders(sorted.slice(0, 5) as RecentOrder[]);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  const STAT_CARDS = [
    { label: "إجمالي الطلبات", value: stats.totalOrders, icon: ShoppingBag, color: "bg-blue-50 text-blue-600", href: "/admin/orders" },
    { label: "طلبات جديدة", value: stats.newOrders, icon: Clock, color: "bg-orange-50 text-orange-600", href: "/admin/orders" },
    { label: "الأرباح المحققة", value: `${stats.totalRevenue.toLocaleString()} د.ج`, icon: TrendingUp, color: "bg-green-50 text-green-600", href: "/admin/orders" },
    { label: "المنتجات النشطة", value: stats.totalProducts, icon: Package, color: "bg-purple-50 text-purple-600", href: "/admin/products" },
    { label: "إجمالي الزبائن", value: stats.totalCustomers, icon: Users, color: "bg-indigo-50 text-indigo-600", href: "/admin/customers" },
    { label: "زبائن VIP", value: stats.vipCustomers, icon: Crown, color: "bg-yellow-50 text-yellow-600", href: "/admin/customers" },
  ];

  return (
    <div className="space-y-8 relative">
      {/* Hero Welcome */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2">لوحة التحكم والمراقبة</h1>
          <p className="text-gray-400 font-medium">مرحباً! إليك نظرة عامة شاملة ومباشرة على أداء منظومة المبيعات الخاصة بك اليوم.</p>
        </div>
        <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary relative">
            <Bell size={20} />
            {stats.newOrders > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900 animate-pulse" />
            )}
          </div>
          <div>
            <p className="text-white text-sm font-bold">تنبيهات فورية</p>
            <p className="text-gray-400 text-xs">لديك {stats.newOrders} طلبات جديدة!</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {STAT_CARDS.map((card, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            key={card.label}
          >
            <Link
              href={card.href}
              className="bg-white rounded-[2rem] p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col md:flex-row items-start md:items-center gap-5 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${card.color}`}>
                <card.icon size={26} />
              </div>
              <div>
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-1.5">{card.label}</p>
                <p className="text-2xl md:text-3xl font-black text-gray-900">
                  {isLoading ? <span className="w-16 h-8 bg-gray-50 rounded-lg animate-pulse inline-block" /> : card.value}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-3">
           <div className="w-2 h-8 bg-primary rounded-full" /> إجراءات سريعة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { href: "/admin/products", label: "إضافة منتج", icon: Package, color: "bg-primary text-white hover:bg-primary/90" },
            { href: "/admin/offers", label: "إنشاء عرض VIP", icon: Crown, color: "bg-yellow-500 text-white hover:bg-yellow-600" },
            { href: "/admin/orders", label: "إدارة الطلبات السريعة", icon: ShoppingBag, color: "bg-gray-900 text-white hover:bg-gray-800" },
            { href: "/admin/settings", label: "تعديل إعدادات المتجر", icon: Users, color: "bg-indigo-600 text-white hover:bg-indigo-700" },
          ].map((action, idx) => (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + (idx * 0.05) }} key={action.label}>
              <Link
                href={action.href}
                className={`${action.color} rounded-[2rem] p-6 font-bold flex flex-col gap-4 text-center transition-all shadow-lg hover:shadow-xl items-center justify-center`}
              >
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                  <action.icon size={24} />
                </div>
                <span className="text-sm font-black tracking-tight">{action.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-black text-gray-900">آخر الطلبات</h2>
          <Link href="/admin/orders" className="text-primary text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
            عرض الكل <ArrowLeft size={14} />
          </Link>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1,2,3].map(i => (
                <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold">لا توجد طلبات بعد</p>
            </div>
          ) : (
              <table className="w-full text-right text-sm">
        <thead>
          <tr className="bg-gray-50/50 text-gray-400 text-[11px] font-black tracking-widest uppercase border-b border-gray-100">
            <th className="px-6 py-5 rounded-tr-2xl">رقم الطلب</th>
            <th className="px-6 py-5">العميل ومعلومات الاتصال</th>
            <th className="px-6 py-5">المبلغ الإجمالي</th>
            <th className="px-6 py-5">حالة الطلب الحيّة</th>
            <th className="px-6 py-5 rounded-tl-2xl">التاريخ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {recentOrders.map(order => {
            const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.new;
            const StatusIcon = status.icon;
            
            return (
              <tr key={order.id} className="hover:bg-primary/5 transition-colors group">
                <td className="px-6 py-4 font-black text-gray-900">
                  <div className="bg-gray-100 w-10 h-10 rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    #{order.order_number}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{order.customer_name}</p>
                  <p className="text-gray-400 text-xs font-medium mt-1 flex items-center gap-1"><span dir="ltr">{order.customer_phone}</span></p>
                </td>
                <td className="px-6 py-4 font-black text-gray-900 text-lg">{order.total_price?.toLocaleString()} د.ج</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black shadow-sm ${status.color}`}>
                    <StatusIcon size={14} /> {status.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400 font-bold text-xs">
                  {new Date(order.created_at).toLocaleDateString("ar-DZ", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
          )}
        </div>
      </div>
    </div>
  );
}
