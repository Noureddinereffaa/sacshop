"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { 
  BarChart3, TrendingUp, TrendingDown, 
  DollarSign, PackageCheck, Target, 
  Download, Calculator, Activity,
  Facebook, ShoppingCart, Percent, AlertCircle, Users
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Order {
  id: string;
  status: string;
  total_price: number;
  customer_phone: string;
  created_at: string;
  metadata?: any;
}

interface FbMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  cpc: number;
  cpm: number;
  fb_purchases: number;
  fb_leads: number;
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [fbMetrics, setFbMetrics] = useState<FbMetrics | null>(null);
  const [ltvData, setLtvData] = useState<{ totalCustomers: number; repeatRate: string; avgLtv: number }>({ totalCustomers: 0, repeatRate: "0", avgLtv: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isFbLoading, setIsFbLoading] = useState(true);
  const [fbError, setFbError] = useState<string | null>(null);
  
  // Settings
  const [datePreset, setDatePreset] = useState("last_30d");
  const [cogsPercent, setCogsPercent] = useState<number>(30);

  useEffect(() => {
    fetchData();
  }, [datePreset]);

  async function fetchData() {
    setIsLoading(true);
    setIsFbLoading(true);
    setFbError(null);

    // 1. Fetch Orders from Supabase based on date
    if (supabase) {
      // Calculate date boundary
      let startDate = new Date();
      if (datePreset === 'today') startDate.setHours(0,0,0,0);
      else if (datePreset === 'yesterday') {
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0,0,0,0);
      } else if (datePreset === 'last_7d') startDate.setDate(startDate.getDate() - 7);
      else if (datePreset === 'last_30d') startDate.setDate(startDate.getDate() - 30);
      else if (datePreset === 'this_month') startDate.setDate(1);
      
      let query = supabase.from("orders").select("id, status, total_price, customer_phone, created_at, metadata");
      
      if (datePreset !== 'lifetime') {
        if (datePreset === 'yesterday') {
          const endDate = new Date(startDate);
          endDate.setHours(23,59,59,999);
          query = query.gte("created_at", startDate.toISOString()).lte("created_at", endDate.toISOString());
        } else {
          query = query.gte("created_at", startDate.toISOString());
        }
      }

      const { data, error } = await query;
      if (!error && data) setOrders(data);

      // Fetch LTV Data (All-time snapshot)
      if (datePreset === "last_30d" || ltvData.totalCustomers === 0) {
        const { data: customers } = await supabase.from("customers").select("total_orders, total_spent");
        if (customers && customers.length > 0) {
          const repeatCustomers = customers.filter(c => c.total_orders > 1).length;
          const totalSpent = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
          setLtvData({
            totalCustomers: customers.length,
            repeatRate: ((repeatCustomers / customers.length) * 100).toFixed(1),
            avgLtv: Math.round(totalSpent / customers.length)
          });
        }
      }
      setIsLoading(false);
    }

    // 2. Fetch Facebook Metrics
    try {
      const res = await fetch(`/api/marketing/ads-metrics?date_preset=${datePreset}`);
      const fbData = await res.json();
      
      if (fbData.success && fbData.data) {
        setFbMetrics(fbData.data);
      } else {
        setFbError(fbData.message || fbData.error?.error?.message || "لم يتم إعداد ربط فيسبوك بشكل صحيح");
      }
    } catch (err: any) {
      setFbError("فشل الاتصال بفيسبوك");
    } finally {
      setIsFbLoading(false);
    }
  }

  // --- Calculations ---
  const totalOrders = orders.length;
  const confirmedStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
  const confirmedOrders = orders.filter(o => confirmedStatuses.includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  const confirmationRate = totalOrders > 0 ? ((confirmedOrders.length / totalOrders) * 100).toFixed(1) : "0.0";
  const deliveryRate = confirmedOrders.length > 0 ? ((deliveredOrders.length / confirmedOrders.length) * 100).toFixed(1) : "0.0";

  const totalDeliveredRevenue = deliveredOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
  const aov = deliveredOrders.length > 0 ? Math.round(totalDeliveredRevenue / deliveredOrders.length) : 0;

  const adSpend = fbMetrics?.spend || 0;
  const costOfGoods = (totalDeliveredRevenue * cogsPercent) / 100;
  const netProfit = totalDeliveredRevenue - adSpend - costOfGoods;
  
  const trueRoas = adSpend > 0 ? (totalDeliveredRevenue / adSpend).toFixed(2) : "0.00";
  const trueCpa = deliveredOrders.length > 0 ? Math.round(adSpend / deliveredOrders.length) : 0;
  const cpl = confirmedOrders.length > 0 ? Math.round(adSpend / confirmedOrders.length) : 0;

  // UTM Campaign Breakdown
  const campaignStats = useMemo(() => {
    const stats: Record<string, { total: number, confirmed: number, delivered: number, revenue: number }> = {};
    orders.forEach(o => {
      const camp = o.metadata?.utms?.utm_campaign || "عضوي / غير محدد";
      if (!stats[camp]) stats[camp] = { total: 0, confirmed: 0, delivered: 0, revenue: 0 };
      stats[camp].total += 1;
      if (confirmedStatuses.includes(o.status)) stats[camp].confirmed += 1;
      if (o.status === 'delivered') {
        stats[camp].delivered += 1;
        stats[camp].revenue += (o.total_price || 0);
      }
    });
    return Object.entries(stats).sort((a,b) => b[1].total - a[1].total);
  }, [orders]);

  // Chart Data Preparation
  const chartData = useMemo(() => {
    const dataMap: Record<string, { date: string, leads: number, revenue: number }> = {};
    
    // Create base dates
    const today = new Date();
    let days = 30;
    if (datePreset === 'last_7d') days = 7;
    else if (datePreset === 'this_month') days = today.getDate();
    else if (datePreset === 'today' || datePreset === 'yesterday') days = 1;
    
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('ar-DZ', { month: 'short', day: 'numeric' });
      dataMap[dateStr] = { date: dateStr, leads: 0, revenue: 0 };
    }

    orders.forEach(o => {
      const d = new Date(o.created_at);
      const dateStr = d.toLocaleDateString('ar-DZ', { month: 'short', day: 'numeric' });
      if (dataMap[dateStr]) {
        dataMap[dateStr].leads += 1;
        if (o.status === 'delivered') {
          dataMap[dateStr].revenue += (o.total_price || 0);
        }
      }
    });

    return Object.values(dataMap);
  }, [orders, datePreset]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
            <Activity className="text-primary" size={32} />
            لوحة المراقبة الإعلانية (Ads Truth)
          </h1>
          <p className="text-gray-500 font-medium mt-2">
            مقارنة أداء فيسبوك مع مبيعات المتجر الحقيقية
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-200">
          <select 
            value={datePreset} 
            onChange={(e) => setDatePreset(e.target.value)}
            className="bg-white border-none px-4 py-2 rounded-xl font-bold text-gray-700 outline-none shadow-sm cursor-pointer"
          >
            <option value="today">اليوم</option>
            <option value="yesterday">الأمس</option>
            <option value="last_7d">آخر 7 أيام</option>
            <option value="last_30d">آخر 30 يوم</option>
            <option value="this_month">هذا الشهر</option>
            <option value="lifetime">كل الوقت</option>
          </select>
        </div>
      </div>

      {/* Split Dashboard: FB vs Reality */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Facebook Side */}
        <div className="bg-gradient-to-br from-[#1877F2]/5 to-[#1877F2]/10 rounded-3xl p-6 border-2 border-[#1877F2]/20 relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#1877F2] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#1877F2]/30">
                <Facebook size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">بيانات فيسبوك (Facebook API)</h2>
                <p className="text-sm font-bold text-gray-500">ما يعتقده فيسبوك أنه حدث</p>
              </div>
            </div>
          </div>

          {isFbLoading ? (
             <div className="h-40 flex items-center justify-center font-bold text-[#1877F2] animate-pulse">جاري سحب البيانات من فيسبوك...</div>
          ) : fbError ? (
            <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-red-200 text-center">
               <AlertCircle className="text-red-500 mx-auto mb-3" size={32} />
               <p className="text-red-600 font-bold mb-2">تعذر جلب بيانات فيسبوك</p>
               <p className="text-sm text-gray-500">{fbError}</p>
               <p className="text-xs mt-4 text-gray-400">تأكد من إدخال Ad Account ID و Access Token بشكل صحيح في الإعدادات.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#1877F2]/10">
                <p className="text-xs font-bold text-gray-500 mb-1">المصروفات (Spend)</p>
                <p className="text-2xl font-black text-[#1877F2]">{adSpend.toLocaleString()} <span className="text-sm">د.ج</span></p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#1877F2]/10">
                <p className="text-xs font-bold text-gray-500 mb-1">النقرات (Link Clicks)</p>
                <p className="text-2xl font-black text-gray-800">{fbMetrics?.clicks}</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#1877F2]/10">
                <p className="text-xs font-bold text-gray-500 mb-1">تكلفة النقرة (CPC)</p>
                <p className="text-lg font-black text-gray-800">{fbMetrics?.cpc.toFixed(2)} د.ج</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#1877F2]/10">
                <p className="text-xs font-bold text-gray-500 mb-1">تكلفة الألف ظهور (CPM)</p>
                <p className="text-lg font-black text-gray-800">{fbMetrics?.cpm.toFixed(2)} د.ج</p>
              </div>
              <div className="bg-[#1877F2] rounded-2xl p-4 shadow-sm text-white col-span-2 flex justify-between items-center">
                <div>
                   <p className="text-xs font-bold text-blue-100 mb-1">المشتريات في فيسبوك (Purchases)</p>
                   <p className="text-3xl font-black">{fbMetrics?.fb_purchases}</p>
                </div>
                <div className="text-right">
                   <p className="text-xs font-bold text-blue-100 mb-1">التكلفة (CPA) حسب فيسبوك</p>
                   <p className="text-xl font-black">
                     {fbMetrics?.fb_purchases ? Math.round(adSpend / fbMetrics.fb_purchases).toLocaleString() : 0} د.ج
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Store Reality Side */}
        <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-3xl p-6 border-2 border-primary/20 relative overflow-hidden">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
                <ShoppingCart size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900">بيانات المتجر (Store Reality)</h2>
                <p className="text-sm font-bold text-gray-500">ما حدث على أرض الواقع</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-primary/10">
              <p className="text-xs font-bold text-gray-500 mb-1">الطلبات الواردة (Leads)</p>
              <p className="text-2xl font-black text-gray-800">{totalOrders}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-primary/10">
              <p className="text-xs font-bold text-gray-500 mb-1">الطلبات المؤكدة (Confirmed)</p>
              <div className="flex items-end gap-2">
                 <p className="text-2xl font-black text-gray-800">{confirmedOrders.length}</p>
                 <p className="text-xs font-bold text-primary mb-1">({confirmationRate}%)</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-primary/10">
              <p className="text-xs font-bold text-gray-500 mb-1">الطلبات المستلمة (Delivered)</p>
              <div className="flex items-end gap-2">
                 <p className="text-2xl font-black text-gray-800">{deliveredOrders.length}</p>
                 <p className="text-xs font-bold text-green-500 mb-1">({deliveryRate}%)</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-primary/10">
              <p className="text-xs font-bold text-gray-500 mb-1">متوسط قيمة الطلب (AOV)</p>
              <p className="text-lg font-black text-gray-800">{aov.toLocaleString()} د.ج</p>
            </div>
            
            {/* LTV Block inside Store Side */}
            <div className="col-span-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-4 shadow-sm border border-orange-200">
               <div className="flex items-center gap-2 mb-3">
                 <Users className="text-orange-500" size={18} />
                 <p className="text-sm font-black text-orange-900">القيمة الدائمة للعملاء (Customer LTV)</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <p className="text-[10px] font-bold text-orange-600 mb-1">معدل رجوع الزبائن</p>
                   <p className="text-lg font-black text-orange-900">{ltvData.repeatRate}%</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-orange-600 mb-1">متوسط صرف العميل لمدى الحياة</p>
                   <p className="text-lg font-black text-orange-900">{ltvData.avgLtv.toLocaleString()} د.ج</p>
                 </div>
               </div>
            </div>

            <div className="bg-gray-900 rounded-2xl p-4 shadow-sm text-white col-span-2 flex justify-between items-center">
              <div>
                 <p className="text-xs font-bold text-gray-400 mb-1">الأرباح الإجمالية (Delivered Revenue)</p>
                 <p className="text-3xl font-black text-green-400">{totalDeliveredRevenue.toLocaleString()} <span className="text-sm">د.ج</span></p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm mt-8">
         <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
           <TrendingUp className="text-primary" size={24} /> منحنى الأداء الزمني (Performance Trends)
         </h3>
         <div className="h-[300px] w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dx={-10} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dx={10} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontFamily: 'inherit', fontWeight: 'bold' }}
                  labelStyle={{ color: '#6B7280', marginBottom: '8px' }}
                />
                <Area yAxisId="left" type="monotone" name="الأرباح (د.ج)" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area yAxisId="right" type="monotone" name="الطلبات" dataKey="leads" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" />
              </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* The TRUTH Dashboard (ROI & Profit) */}
      <div className="bg-gray-900 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden mt-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 relative z-10 border-b border-gray-800 pb-8">
          <div>
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Target className="text-primary" size={36} /> الحقيقة المُرة (The Truth)
            </h2>
            <p className="text-gray-400 font-medium mt-2 text-sm">التكلفة والعائد الحقيقي بناءً على التوصيل وليس على بيانات فيسبوك الوهمية.</p>
          </div>
          
          <div className="flex items-center gap-3 bg-black/40 p-3 rounded-2xl border border-gray-800">
            <Percent size={18} className="text-gray-400" />
            <span className="text-sm font-bold text-gray-300">نسبة تكلفة السلع (COGS):</span>
            <input 
              type="number" 
              value={cogsPercent}
              onChange={e => setCogsPercent(Number(e.target.value))}
              className="w-16 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white font-bold text-center outline-none focus:border-primary"
            />
            <span className="text-sm font-bold text-gray-400">%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
          <div className="bg-black/40 rounded-2xl p-6 border border-gray-800">
            <p className="text-gray-400 text-sm font-bold mb-2">التكلفة الحقيقية للمبيعة المكتملة (True CPA)</p>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-black text-white">{trueCpa.toLocaleString()}</p>
              <p className="text-sm font-bold text-gray-500 mb-1">د.ج / مستلم</p>
            </div>
            <p className="text-xs text-gray-500 mt-3">مقابل {fbMetrics?.fb_purchases ? Math.round(adSpend / fbMetrics.fb_purchases).toLocaleString() : 0} د.ج في فيسبوك</p>
          </div>

          <div className="bg-black/40 rounded-2xl p-6 border border-gray-800">
             <p className="text-gray-400 text-sm font-bold mb-2">تكلفة تأكيد الطلب (CPL Confirmed)</p>
            <div className="flex items-end gap-3">
              <p className="text-4xl font-black text-white">{cpl.toLocaleString()}</p>
              <p className="text-sm font-bold text-gray-500 mb-1">د.ج / مؤكد</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary/20 to-transparent rounded-2xl p-6 border border-primary/30">
            <p className="text-primary-100 text-sm font-bold mb-2">الربح الصافي الحقيقي (Net Profit)</p>
            <div className="flex items-end gap-3">
              <p className={`text-4xl font-black ${netProfit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {netProfit > 0 ? '+' : ''}{netProfit.toLocaleString()}
              </p>
              <p className="text-sm font-bold text-gray-400 mb-1">د.ج</p>
            </div>
            <p className="text-xs text-gray-400 mt-3">الإيرادات - الإعلانات - ثمن السلع ({cogsPercent}%)</p>
          </div>
        </div>

        {/* ROAS Banner */}
        <div className="mt-6 bg-white/5 rounded-2xl p-6 border border-white/10 flex justify-between items-center relative z-10">
          <div>
            <p className="text-gray-400 font-bold mb-1">العائد على الاستثمار الحقيقي (True ROAS)</p>
            <p className="text-xs text-gray-500">لكل 1 د.ج تصرفه على الإعلانات، يعود لك...</p>
          </div>
          <div className="text-left">
            <p className={`text-5xl font-black ${Number(trueRoas) >= 2 ? 'text-green-400' : Number(trueRoas) >= 1 ? 'text-yellow-400' : 'text-red-400'}`}>
              {trueRoas}x
            </p>
          </div>
        </div>
      </div>

      {/* UTM Campaign Breakdown */}
      {campaignStats.length > 0 && (
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm">
           <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
             <Target className="text-primary" size={24} /> تفصيل الأداء حسب الحملة (UTM_Campaign)
           </h3>
           <div className="overflow-x-auto">
             <table className="w-full text-right">
               <thead>
                 <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest border-b border-gray-100">
                   <th className="px-4 py-3 rounded-tr-xl">اسم الحملة (Campaign)</th>
                   <th className="px-4 py-3">الطلبات (Leads)</th>
                   <th className="px-4 py-3">المؤكدة</th>
                   <th className="px-4 py-3">المستلمة</th>
                   <th className="px-4 py-3 rounded-tl-xl">الإيرادات (Revenue)</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50 text-sm">
                 {campaignStats.map(([camp, stat]) => (
                   <tr key={camp} className="hover:bg-gray-50 transition-colors">
                     <td className="px-4 py-4 font-black text-gray-900" dir="ltr">{camp}</td>
                     <td className="px-4 py-4 font-bold text-gray-600">{stat.total}</td>
                     <td className="px-4 py-4 font-bold text-gray-600">{stat.confirmed}</td>
                     <td className="px-4 py-4 font-black text-green-600">{stat.delivered}</td>
                     <td className="px-4 py-4 font-black text-primary">{stat.revenue.toLocaleString()} د.ج</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      )}

    </div>
  );
}
