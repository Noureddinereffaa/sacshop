import { supabase } from "@/lib/supabase";
import { CartItem } from "@/types";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface OrderPDFData {
  orderId: string;
  customerName: string;
  customerPhone: string;
  productName: string;
  quantity: number;
  productPrice: number;
  discountAmount: number;
  selectedSize?: string;
  selectedColor?: string;
  notes?: string;
  cartItems?: CartItem[];
}

/**
 * Generates a PDF for the order using html2canvas + jsPDF,
 * uploads it to Supabase Storage, and returns the public URL.
 */
export async function generateAndUploadOrderPDF(data: OrderPDFData): Promise<string> {
  let container: HTMLDivElement | null = null;
  
  try {
    const isCartOrder = data.cartItems && data.cartItems.length > 0;
    const shortId = data.orderId.split("-")[0].toUpperCase();
    const finalTotal = data.productPrice;

    // Build HTML receipt content (rendered off-screen)
    container = document.createElement("div");
  container.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    width: 595px; background: white; direction: rtl;
    font-family: 'Tahoma', 'Arial Unicode MS', Arial, sans-serif;
    color: #111; font-size: 14px; line-height: 1.8;
  `;

  let itemsHtml = "";
  if (isCartOrder && data.cartItems) {
    itemsHtml = data.cartItems.map((item, i) => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 16px; text-align: right;">${i + 1}. ${item.name}</td>
        <td style="padding: 10px 16px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 16px; text-align: center;">${item.size || "—"}</td>
        <td style="padding: 10px 16px; text-align: center;">${item.color || "—"}</td>
        <td style="padding: 10px 16px; text-align: left; font-weight: bold; color: #10a37f;">
          ${(item.price * item.quantity).toLocaleString()} د.ج
        </td>
      </tr>
    `).join("");
  } else {
    itemsHtml = `
      <tr>
        <td style="padding: 10px 16px; text-align: right; font-weight: bold;">${data.productName}</td>
        <td style="padding: 10px 16px; text-align: center;">${data.quantity}</td>
        <td style="padding: 10px 16px; text-align: center;">${data.selectedSize || "—"}</td>
        <td style="padding: 10px 16px; text-align: center;">${data.selectedColor || "—"}</td>
        <td style="padding: 10px 16px; text-align: left; font-weight: bold; color: #10a37f;">
          ${finalTotal.toLocaleString()} د.ج
        </td>
      </tr>
    `;
  }

  container.innerHTML = `
    <div style="padding: 40px;">
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #10a37f, #0d8a6b); color: white; padding: 28px 32px; border-radius: 12px; margin-bottom: 30px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">SacShop.dz</div>
            <div style="font-size: 12px; opacity: 0.85; margin-top: 4px;">وصل الطلب الرسمي</div>
          </div>
          <div style="text-align: left;">
            <div style="background: rgba(255,255,255,0.2); border-radius: 8px; padding: 10px 16px;">
              <div style="font-size: 11px; opacity: 0.8;">رقم الطلب</div>
              <div style="font-size: 20px; font-weight: 900; letter-spacing: 2px;">#${shortId}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Customer Info -->
      <div style="background: #f8fafb; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px; display: flex; gap: 40px;">
        <div>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">الاسم</div>
          <div style="font-weight: 700; font-size: 16px;">${data.customerName}</div>
        </div>
        <div>
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">رقم الهاتف</div>
          <div style="font-weight: 700; font-size: 16px; direction: ltr;">${data.customerPhone}</div>
        </div>
        <div style="margin-right: auto;">
          <div style="font-size: 11px; color: #888; margin-bottom: 4px;">التاريخ</div>
          <div style="font-weight: 700; font-size: 14px;">${new Date().toLocaleDateString("ar-DZ", { year: "numeric", month: "long", day: "numeric" })}</div>
        </div>
      </div>

      <!-- Items Table -->
      <div style="margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: 900; color: #555; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">تفاصيل المنتجات</div>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #eee; border-radius: 10px; overflow: hidden;">
          <thead>
            <tr style="background: #f0fdf4; color: #10a37f;">
              <th style="padding: 12px 16px; text-align: right; font-size: 12px; font-weight: 900;">المنتج</th>
              <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 900;">الكمية</th>
              <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 900;">المقاس</th>
              <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 900;">اللون</th>
              <th style="padding: 12px 16px; text-align: center; font-size: 12px; font-weight: 900;">السعر</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>

      <!-- Totals -->
      <div style="background: #f0fdf4; border: 1px solid #d1fae5; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px;">
        ${data.discountAmount > 0 ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #666;">
            <span>السعر الأصلي</span>
            <span>${(finalTotal + data.discountAmount).toLocaleString()} د.ج</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #16a34a; font-weight: bold;">
            <span>خصم (10%)</span>
            <span>- ${data.discountAmount.toLocaleString()} د.ج</span>
          </div>
        ` : ""}
        <div style="display: flex; justify-content: space-between; border-top: 2px solid #10a37f; padding-top: 14px; margin-top: 8px;">
          <span style="font-size: 18px; font-weight: 900; color: #10a37f;">المجموع النهائي</span>
          <span style="font-size: 24px; font-weight: 900; color: #10a37f;">${finalTotal.toLocaleString()} د.ج</span>
        </div>
      </div>

      ${data.notes ? `
        <div style="background: #fffbeb; border: 1px solid #fcd34d; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px;">
          <div style="font-size: 12px; font-weight: 900; color: #92400e; margin-bottom: 6px;">ملاحظات العميل</div>
          <div style="color: #78350f;">${data.notes}</div>
        </div>
      ` : ""}

      <!-- Footer -->
      <div style="text-align: center; color: #aaa; font-size: 11px; border-top: 1px solid #eee; padding-top: 20px; margin-top: 10px;">
        <div style="font-weight: 900; color: #10a37f; font-size: 14px; margin-bottom: 4px;">SacShop.dz</div>
        هذا وصل طلب رسمي — لا يمكن تعديله
      </div>
    </div>
  `;

  document.body.appendChild(container);

  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const pdf = new jsPDF("p", "pt", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

  const pdfBlob = pdf.output("blob");

  // Upload to Supabase Storage
  if (!supabase) throw new Error("Supabase is missing configuration.");

  const fileName = `order-${shortId}-${Date.now()}.pdf`;
  
  // Attempt upload
  const { error: uploadError } = await supabase.storage
    .from("orders")
    .upload(fileName, pdfBlob, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    if (uploadError.message.includes("Bucket not found")) {
      throw new Error("⚠️ 'orders' bucket not found. Please create a public bucket named 'orders' in Supabase Storage.");
    }
    throw uploadError;
  }

  const { data: publicUrlData } = supabase.storage
    .from("orders")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
} catch (err: any) {
  console.error("PDF Generate/Upload Error:", err);
  // Show alert during this phase to help the user identify the issue
  if (typeof window !== "undefined") {
    alert("فشل إنشاء الوصل: " + (err.message || "خطأ غير معروف"));
  }
  throw err;
} finally {
  if (container && document.body.contains(container)) {
    document.body.removeChild(container);
  }
}
}
