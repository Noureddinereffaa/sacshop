import { getSupabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import ReceiptActions from "./ReceiptActions";

export const revalidate = 0; // Always fetch fresh data

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = getSupabase();
  if (!supabase) return <div className="p-8 text-center text-red-500 font-bold">حدث خطأ في الاتصال بقاعدة البيانات</div>;

  // 1. Fetch Order Data
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, products(name, image_url)")
    .eq("id", id)
    .single();

  if (orderError || !order) {
    return notFound();
  }

  // 2. Fetch Branding Data
  let branding = {
    storeName: "Service Serigraphie",
    logo: "",
    primaryColor: "#00AEEF",
  };

  const { data: settingsData } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "branding")
    .maybeSingle();

  if (settingsData?.value) {
    branding = { ...branding, ...settingsData.value };
  }

  const isCartOrder = order.cart_items && order.cart_items.length > 0;
  const shortId = order.id.split("-")[0].toUpperCase();
  const finalTotal = order.total_price;
  const productPrice = order.product_price || finalTotal;
  const discountAmount = order.discount_amount || 0;
  const metadata = order.metadata || {};
  const customVariantSelections = metadata.custom_variants || {};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      
      {/* ── Top Bar (Hidden in Print) ── */}
      <div className="w-full max-w-3xl flex justify-between items-center mb-6 print:hidden">
        <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black font-bold transition-colors">
          ← العودة للمتجر
        </Link>
        <ReceiptActions />
      </div>

      {/* ── Receipt Container ── */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden print:shadow-none print:rounded-none">
        
        {/* Header Section */}
        <div className="p-8 sm:p-12" style={{ borderTop: `8px solid ${branding.primaryColor}` }}>
          
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-gray-100 pb-8">
            <div className="flex-1">
              {branding.logo ? (
                <img src={branding.logo} alt="Logo" className="max-h-24 mb-4 object-contain" />
              ) : (
                <div className="text-4xl font-black mb-2" style={{ color: branding.primaryColor }}>{branding.storeName}</div>
              )}
              <div className="text-sm text-gray-500 font-bold">أفضل خدمات الطباعة والتغليف في الجزائر</div>
            </div>
            
            <div className="shrink-0 flex flex-col items-end sm:items-center">
              <div 
                className="text-white px-6 py-4 rounded-2xl shadow-lg relative z-10 min-w-[180px] text-center"
                style={{ backgroundColor: branding.primaryColor }}
              >
                <div className="text-xs font-bold opacity-90 mb-1">رقم الطلب الرسمي</div>
                <div className="text-2xl font-black tracking-wider font-sans">#{shortId}</div>
              </div>
              <div className="flex items-center gap-1.5 mt-3 text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
                ✓ تم التسجيل
              </div>
            </div>
          </div>

          {/* Billing Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="text-xs font-black uppercase mb-4 pb-2 border-b border-gray-200" style={{ color: branding.primaryColor }}>بيانات العميل المستلم</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold text-sm">اسم العميل:</span>
                  <span className="font-black text-gray-900">{order.customer_name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold text-sm">رقم الهاتف:</span>
                  <span className="font-black text-gray-900" dir="ltr">{order.customer_phone}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <div className="text-xs font-black uppercase mb-4 pb-2 border-b border-gray-200" style={{ color: branding.primaryColor }}>تفاصيل السجل</div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold text-sm">تاريخ الإنشاء:</span>
                  <span className="font-black text-gray-900">{new Date(order.created_at).toLocaleDateString("ar-DZ")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold text-sm">وقت الطلب:</span>
                  <span className="font-black text-gray-900">{new Date(order.created_at).toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-10 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="py-4 px-5 font-black text-xs">تفاصيل المنتج والمواصفات</th>
                  <th className="py-4 px-5 font-black text-xs text-center border-r border-gray-700 hidden sm:table-cell w-28">سعر القطعة</th>
                  <th className="py-4 px-5 font-black text-xs text-center border-r border-gray-700 w-20">الكمية</th>
                  <th className="py-4 px-5 font-black text-xs border-r border-gray-700 w-36">السعر الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {isCartOrder ? (
                  order.cart_items.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="py-5 px-5">
                        <div className="font-black text-gray-900 text-base mb-1">{i + 1}. {item.name}</div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {item.size && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold">المقاس: {item.size}</span>}
                          {item.color && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-bold">اللون: {item.color}</span>}
                          {item.num_colors && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-bold">طباعة: {item.num_colors} ألوان {item.is_double_sided ? '(جهتين)' : ''}</span>}
                        </div>
                      </td>
                      <td className="py-5 px-5 text-center font-bold text-gray-600 border-r border-gray-50 hidden sm:table-cell">{Number(item.price).toLocaleString()} دج</td>
                      <td className="py-5 px-5 text-center font-black text-lg border-r border-gray-50">{item.quantity}</td>
                      <td className="py-5 px-5 font-black text-lg border-r border-gray-50" style={{ color: branding.primaryColor }}>
                        {(Number(item.price) * Number(item.quantity)).toLocaleString()} <span className="text-[10px] opacity-70">دج</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="py-6 px-5">
                      <div className="font-black text-gray-900 text-lg mb-3">{order.products?.name || "منتج مخصص"}</div>
                      <div className="flex flex-wrap gap-2">
                        {order.size && <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold">المقاس: {order.size}</span>}
                        {order.color && <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-bold">اللون: {order.color}</span>}
                        {metadata.num_colors && <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-bold">طباعة: {metadata.num_colors} ألوان {metadata.is_double_sided ? '(جهتين)' : '(جهة)'}</span>}
                        {Object.entries(customVariantSelections).filter(([_, v]) => v).map(([k, v]: any, i: number) => (
                          <span key={i} className="text-[10px] bg-gray-100 text-gray-700 border border-gray-200 px-2 py-1 rounded-md font-bold">
                            {k}: {v}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-6 px-5 text-center font-bold text-gray-600 border-r border-gray-50 hidden sm:table-cell">
                      {order.quantity > 0 ? (productPrice / order.quantity).toLocaleString() : productPrice.toLocaleString()} <span className="text-[10px]">دج</span>
                    </td>
                    <td className="py-6 px-5 text-center font-black text-xl border-r border-gray-50">{order.quantity}</td>
                    <td className="py-6 px-5 font-black text-xl border-r border-gray-50" style={{ color: branding.primaryColor }}>
                      {productPrice.toLocaleString()} <span className="text-[10px] opacity-70">دج</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-8 flex justify-end">
            <div className="w-full sm:w-80 bg-gray-900 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden" style={{ boxShadow: `0 20px 40px ${branding.primaryColor}20` }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
              
              {discountAmount > 0 && (
                <>
                  <div className="flex justify-between items-center mb-3 text-sm font-bold opacity-80">
                    <span>المجموع الفرعي</span>
                    <span>{(finalTotal + discountAmount).toLocaleString()} دج</span>
                  </div>
                  <div className="flex justify-between items-center mb-4 text-sm font-black text-green-400">
                    <span>إجمالي الخصم المطبق</span>
                    <span>- {discountAmount.toLocaleString()} دج</span>
                  </div>
                  <div className="border-t border-gray-700 my-4"></div>
                </>
              )}
              
              <div className="flex justify-between items-center">
                <span className="text-base font-black opacity-90">المبلغ المطلوب</span>
                <span className="text-3xl font-black" style={{ color: branding.primaryColor }}>
                  {finalTotal.toLocaleString()} <span className="text-sm font-bold text-white opacity-80">دج</span>
                </span>
              </div>
            </div>
          </div>

          {/* Footer & Stamps */}
          <div className="mt-16 pt-8 border-t border-gray-100 text-center relative">
            <div className="text-2xl font-black mb-2 tracking-wide" style={{ color: branding.primaryColor }}>{branding.storeName}</div>
            <div className="text-sm text-gray-500 font-bold mb-6">هذا الوصل وثيقة رسمية معتمدة لخدمات الطباعة والتغليف</div>
            
            <div className="flex justify-center items-center gap-6 sm:gap-12 flex-wrap">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">✔</div>
                جودة مضمونة 100%
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">✔</div>
                توصيل لـ 58 ولاية
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                <div className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">✔</div>
                دعم فني 24/7
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="mt-8 mb-12 text-center text-xs font-bold text-gray-400 print:hidden">
        Powered by Antigravity Agency
      </div>
    </div>
  );
}
