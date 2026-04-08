"use client";

import { useSearchParams } from "next/navigation";
import { Printer, Download, MapPin, Phone, Mail } from "lucide-react";

export default function Invoice({ order }: { order: any }) {
  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto bg-white p-12 border border-gray-100 shadow-2xl rounded-[3rem] my-12" id="invoice">
      {/* Invoice Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16 border-b border-gray-100 pb-12">
        <div className="flex items-center gap-4">
           <div className="w-16 h-16 bg-primary rounded-[1.5rem] flex items-center justify-center text-white font-bold text-3xl">S</div>
           <div>
              <h1 className="text-3xl font-black text-gray-950 uppercase tracking-tighter">فاتورة شراء</h1>
              <p className="text-primary font-bold">#ORD-{order.order_number}</p>
           </div>
        </div>
        <div className="text-right space-y-2">
           <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">تاريخ الفاتورة</p>
           <p className="text-xl font-black text-gray-900">{new Date(order.created_at).toLocaleDateString('ar-DZ')}</p>
        </div>
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 px-4">
         <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">محرر بواسطة</h3>
            <div className="space-y-2">
               <p className="text-lg font-black text-gray-900">SacShop الجزائر</p>
               <p className="text-sm text-gray-500 flex items-center gap-2 justify-end">
                  الجزائر العاصمة، بئر مراد رايس <MapPin size={14} />
               </p>
               <p className="text-sm text-gray-500 flex items-center gap-2 justify-end">
                  +213 5XX XX XX XX <Phone size={14} />
               </p>
            </div>
         </div>
         <div className="text-right space-y-4 border-r border-gray-100 pr-8">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">مُرسل إلى</h3>
            <div className="space-y-2">
               <p className="text-lg font-black text-gray-900">{order.customer_name}</p>
               <p className="text-sm text-gray-500 flex items-center gap-2 justify-end">
                  {order.customer_address} <MapPin size={14} />
               </p>
               <p className="text-sm text-gray-500 flex items-center gap-2 justify-end">
                  {order.customer_phone} <Phone size={14} />
               </p>
            </div>
         </div>
      </div>

      {/* Items Table */}
      <div className="bg-gray-50 rounded-[2rem] overflow-hidden mb-12">
         <table className="w-full text-right">
            <thead>
               <tr className="bg-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-200">
                  <th className="px-8 py-4">المنتج</th>
                  <th className="px-8 py-4">الكمية</th>
                  <th className="px-8 py-4">سعر الوحدة</th>
                  <th className="px-8 py-4">الإجمالي</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
               <tr>
                  <td className="px-8 py-6 font-bold text-gray-900">أكياس ورقية (موديل {order.size || 'قياسي'})</td>
                  <td className="px-8 py-6 text-gray-500">{order.quantity || 1}</td>
                  <td className="px-8 py-6 text-gray-500">{order.total_price - (order.delivery_fee || 600)} د.ج</td>
                  <td className="px-8 py-6 font-black text-gray-950">{order.total_price - (order.delivery_fee || 600)} د.ج</td>
               </tr>
            </tbody>
         </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end pr-8">
         <div className="w-full max-w-xs space-y-4">
            <div className="flex justify-between items-center text-gray-500 font-bold">
               <span>المجموع الفرعي:</span>
               <span>{order.total_price - (order.delivery_fee || 600)} د.ج</span>
            </div>
            <div className="flex justify-between items-center text-gray-500 font-bold border-b border-gray-100 pb-4">
               <span>رسوم التوصيل:</span>
               <span>{order.delivery_fee || 600} د.ج</span>
            </div>
            <div className="flex justify-between items-center text-primary">
               <span className="text-xl font-black">الإجمالي الكلي:</span>
               <span className="text-3xl font-black">{order.total_price} <span className="text-sm">د.ج</span></span>
            </div>
         </div>
      </div>

      <div className="mt-20 pt-12 border-t border-gray-100 text-center space-y-2">
         <p className="text-xs font-black text-gray-400 uppercase tracking-widest">شكراً لتسوقكم معنا - SacShop.dz</p>
         <p className="text-[10px] text-gray-300">هذه الفاتورة معفاة من الضريبة وفقاً للوائح التجارة الإلكترونية للمقاول الذاتي في الجزائر.</p>
      </div>
    </div>
  );
}
