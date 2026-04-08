"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Search, Loader2, Users, Crown, ShoppingBag, MapPin, Eye, ExternalLink } from "lucide-react";
import Link from "next/link";

interface Customer {
  id: string;
  name: string;
  phone: string;
  wilaya_id: number;
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            <Users className="text-indigo-500" size={32} />
            إدارة الزبائن
          </h1>
          <p className="text-gray-500 mt-1">سجل بجميع زبائن المتجر وتفاصيلهم</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الزبائن", value: customers.length, color: "text-blue-600 bg-blue-50" },
          { label: "زبائن VIP", value: customers.filter(c => c.is_vip).length, color: "text-yellow-600 bg-yellow-50" },
          { label: "متوسط الطلبات للزبون", value: customers.length > 0 ? (customers.reduce((a, c) => a + c.total_orders, 0) / customers.length).toFixed(1) : "0", color: "text-green-600 bg-green-50" },
          { label: "أعلى إنفاق", value: customers.length > 0 ? `${Math.max(...customers.map(c => c.total_spent)).toLocaleString()} د.ج` : "0 د.ج", color: "text-purple-600 bg-purple-50" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-gray-500 text-xs font-bold mb-2">{s.label}</p>
            <p className={`text-2xl font-black px-3 py-1.5 rounded-xl inline-block ${s.color}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="ابحث بالاسم أو رقم الهاتف..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-white border border-gray-200 rounded-xl py-3 pr-12 pl-4 focus:ring-2 focus:ring-primary/20 outline-none font-medium text-sm"
        />
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
                  <th className="px-6 py-5">الزبون</th>
                  <th className="px-6 py-5">رقم الهاتف</th>
                  <th className="px-6 py-5">المشتريات</th>
                  <th className="px-6 py-5">الإنفاق الإجمالي</th>
                  <th className="px-6 py-5">تاريخ آخر طلب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
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
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <MapPin size={10} /> ولاية رقم {customer.wilaya_id}
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
                      <p className="font-black text-primary">{customer.total_spent.toLocaleString()} د.ج</p>
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
    </div>
  );
}
