"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Package, TrendingUp, Users, ShoppingBag, Crown, ArrowLeft, Clock } from "lucide-react";

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

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  new: { label: "جديد", color: "bg-blue-100 text-blue-600" },
  confirmed: { label: "مؤكد", color: "bg-indigo-100 text-indigo-600" },
  processing: { label: "قيد المعالجة", color: "bg-orange-100 text-orange-600" },
  shipped: { label: "في الطريق", color: "bg-purple-100 text-purple-600" },
  delivered: { label: "تم التسليم", color: "bg-green-100 text-green-600" },
  cancelled: { label: "ملغي", color: "bg-red-100 text-red-500" },
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

      const orders = ordersRes.data || [];
      setStats({
        totalOrders: orders.length,
        newOrders: orders.filter(o => o.status === "new").length,
        deliveredOrders: orders.filter(o => o.status === "delivered").length,
        cancelledOrders: orders.filter(o => o.status === "cancelled").length,
        totalRevenue: orders.filter(o => o.status === "delivered").reduce((a, o) => a + (o.total_price || 0), 0),
        totalProducts: productsRes.data?.length || 0,
        totalCustomers: customersRes.data?.length || 0,
        vipCustomers: customersRes.data?.filter(c => c.is_vip).length || 0,
      });
      setRecentOrders(orders.slice(0, 5) as RecentOrder[]);
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
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">لوحة المعلومات</h1>
        <p className="text-gray-500 mt-1">مرحباً! إليك نظرة عامة على أداء متجرك</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map(card => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-4"
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.color}`}>
              <card.icon size={22} />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold mb-1">{card.label}</p>
              <p className="text-2xl font-black text-gray-900">
                {isLoading ? <span className="w-12 h-6 bg-gray-100 rounded animate-pulse inline-block" /> : card.value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-black text-gray-900 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: "/admin/products", label: "إضافة منتج", icon: Package, color: "bg-primary text-white" },
            { href: "/admin/offers", label: "إنشاء عرض VIP", icon: Crown, color: "bg-yellow-500 text-white" },
            { href: "/admin/orders", label: "مراجعة الطلبات", icon: ShoppingBag, color: "bg-gray-900 text-white" },
            { href: "/admin/settings", label: "إعدادات المتجر", icon: Users, color: "bg-indigo-600 text-white" },
          ].map(action => (
            <Link
              key={action.label}
              href={action.href}
              className={`${action.color} rounded-2xl p-5 font-bold flex flex-col gap-3 hover:opacity-90 transition-all shadow-sm hover:shadow-md`}
            >
              <action.icon size={24} />
              <span className="text-sm">{action.label}</span>
            </Link>
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
                <tr className="bg-gray-50 text-gray-500 text-xs font-black tracking-widest border-b border-gray-100">
                  <th className="px-6 py-4">رقم الطلب</th>
                  <th className="px-6 py-4">العميل</th>
                  <th className="px-6 py-4">المبلغ</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map(order => {
                  const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.new;
                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-black text-gray-900">#{order.order_number}</td>
                      <td className="px-6 py-4">
                        <p className="font-bold">{order.customer_name}</p>
                        <p className="text-gray-400 text-xs">{order.customer_phone}</p>
                      </td>
                      <td className="px-6 py-4 font-black text-primary">{order.total_price?.toLocaleString()} د.ج</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-medium">
                        {new Date(order.created_at).toLocaleDateString("ar-DZ")}
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
