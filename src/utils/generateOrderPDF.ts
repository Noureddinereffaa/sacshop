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
  numColors?: number;
  isDoubleSided?: boolean;
  customVariantSelections?: Record<string, string>;
}

/**
 * Generates a luxury PDF for the order using html2canvas + jsPDF,
 * uploads it to Supabase Storage, and returns the public URL.
 */
export async function generateAndUploadOrderPDF(data: OrderPDFData): Promise<string> {
  let container: HTMLDivElement | null = null;
  
  try {
    // 1. Fetch Branding Settings
    let branding = {
      storeName: "Service Serigraphie",
      logo: "",
      primaryColor: "#00AEEF",
    };

    if (supabase) {
      const { data: settingsData } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "branding")
        .maybeSingle();
      
      if (settingsData?.value) {
        branding = { ...branding, ...settingsData.value };
      }
    }

    const isCartOrder = data.cartItems && data.cartItems.length > 0;
    const shortId = data.orderId.split("-")[0].toUpperCase();
    const finalTotal = data.productPrice;

    // Build HTML receipt content
    container = document.createElement("div");
    container.style.cssText = `
      position: fixed; top: -9999px; left: -9999px;
      width: 700px; background: white; direction: rtl;
      font-family: 'Tahoma', 'Arial Unicode MS', Arial, sans-serif;
      color: #1a1a1a; font-size: 14px; line-height: 1.6;
    `;

    // Helper for rendering variant details
    const renderDetails = (item: any) => {
      const details = [];
      if (item.size) details.push(`المقاس: ${item.size}`);
      if (item.color) details.push(`اللون: ${item.color}`);
      if (item.num_colors) details.push(`الطباعة: ${item.num_colors} ألوان ${item.is_double_sided ? "(جهتين)" : "(جهة واحدة)"}`);
      if (item.custom_variants) {
        Object.entries(item.custom_variants).forEach(([k, v]) => {
          if (v) details.push(`${k}: ${v}`);
        });
      }
      return details.length > 0 ? `<div style="font-size: 11px; color: #666; margin-top: 4px; border-top: 1px dashed #eee; padding-top: 4px;">${details.join(" | ")}</div>` : "";
    };

    let itemsHtml = "";
    if (isCartOrder && data.cartItems) {
      itemsHtml = data.cartItems.map((item, i) => `
        <tr style="border-bottom: 1px solid #f0f0f0;">
          <td style="padding: 15px 20px; text-align: right;">
            <div style="font-weight: 800; font-size: 13px;">${i + 1}. ${item.name}</div>
            ${renderDetails({ size: item.size, color: item.color })}
          </td>
          <td style="padding: 15px 20px; text-align: center; font-weight: 700;">${item.quantity}</td>
          <td style="padding: 15px 20px; text-align: left; font-weight: 900; color: ${branding.primaryColor};">
            ${(item.price * item.quantity).toLocaleString()} د.ج
          </td>
        </tr>
      `).join("");
    } else {
      itemsHtml = `
        <tr style="background: white;">
          <td style="padding: 20px; text-align: right;">
            <div style="font-weight: 900; font-size: 15px; color: #111; margin-bottom: 4px;">${data.productName}</div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 11px; color: #666;">
               ${data.selectedSize ? `<span style="background: #f0f9ff; color: ${branding.primaryColor}; padding: 2px 8px; border-radius: 4px; border: 1px solid ${branding.primaryColor}20;">المقاس: ${data.selectedSize}</span>` : ""}
               ${data.selectedColor ? `<span style="background: #f0f9ff; color: ${branding.primaryColor}; padding: 2px 8px; border-radius: 4px; border: 1px solid ${branding.primaryColor}20;">اللون: ${data.selectedColor}</span>` : ""}
               ${data.numColors ? `<span style="background: #f0f9ff; color: ${branding.primaryColor}; padding: 2px 8px; border-radius: 4px; border: 1px solid ${branding.primaryColor}20;">طباعة: ${data.numColors} ألوان ${data.isDoubleSided ? '(جهتين)' : '(جهة واحدة)'}</span>` : ""}
            </div>
            ${data.customVariantSelections ? `
              <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #f0f0f0; display: flex; gap: 8px; flex-wrap: wrap;">
                ${Object.entries(data.customVariantSelections)
                  .filter(([_, v]) => v)
                  .map(([k, v]) => `<span style="font-size: 10px; background: #fafafa; border: 1px solid #eee; padding: 2px 6px; border-radius: 4px; color: #888;"><b>${k}:</b> ${v}</span>`).join("")}
              </div>
            ` : ""}
          </td>
          <td style="padding: 20px; text-align: center; font-weight: 900; font-size: 16px;">${data.quantity}</td>
          <td style="padding: 20px; text-align: left; font-weight: 900; font-size: 18px; color: ${branding.primaryColor};">
            ${finalTotal.toLocaleString()} <span style="font-size: 12px;">د.ج</span>
          </td>
        </tr>
      `;
    }

    container.innerHTML = `
      <div style="padding: 40px; background: #fff;">
        <!-- Luxury Header Section -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; border-bottom: 4px solid ${branding.primaryColor}; padding-bottom: 20px;">
          <div>
            ${branding.logo ? `<img src="${branding.logo}" style="max-height: 70px; margin-bottom: 12px; display: block;" />` : `<div style="font-size: 32px; font-weight: 900; color: ${branding.primaryColor}; margin-bottom: 5px;">${branding.storeName}</div>`}
            <div style="font-size: 12px; color: #888; letter-spacing: 1px;">أفضل خدمات الطباعة والتغليف في الجزائر</div>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 48px; font-weight: 900; color: #f0f0f0; margin-top: -15px;">وصل طلب</div>
            <div style="background: ${branding.primaryColor}; color: white; padding: 10px 20px; border-radius: 8px; display: inline-block; margin-top: -10px; position: relative; z-index: 1; box-shadow: 0 4px 12px ${branding.primaryColor}30;">
              <div style="font-size: 10px; opacity: 0.8; font-weight: bold; margin-bottom: 2px;">رقم الطلب الرسمي</div>
              <div style="font-size: 22px; font-weight: 900; letter-spacing: 2px;">#${shortId}</div>
            </div>
          </div>
        </div>

        <!-- Billing Details Grid -->
        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; margin-bottom: 40px;">
          <div style="background: #fafafa; border-radius: 12px; padding: 25px; border: 1px solid #f0f0f0;">
             <div style="font-size: 11px; font-weight: 900; color: ${branding.primaryColor}; text-transform: uppercase; margin-bottom: 15px; border-bottom: 2px solid ${branding.primaryColor}15; padding-bottom: 5px;">بيانات العميل</div>
             <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between;">
                   <span style="color: #888; font-size: 12px;">اسم العميل:</span>
                   <span style="font-weight: 800; font-size: 14px;">${data.customerName}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                   <span style="color: #888; font-size: 12px;">رقم الهاتف:</span>
                   <span style="font-weight: 800; font-size: 14px; direction: ltr;">${data.customerPhone}</span>
                </div>
             </div>
          </div>
          <div style="background: #fafafa; border-radius: 12px; padding: 25px; border: 1px solid #f0f0f0;">
             <div style="font-size: 11px; font-weight: 900; color: ${branding.primaryColor}; text-transform: uppercase; margin-bottom: 15px; border-bottom: 2px solid ${branding.primaryColor}15; padding-bottom: 5px;">تفاصيل التاريخ</div>
             <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="display: flex; justify-content: space-between;">
                   <span style="color: #888; font-size: 12px;">تاريخ الإنشاء:</span>
                   <span style="font-weight: 800; font-size: 14px;">${new Date().toLocaleDateString("ar-DZ")}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                   <span style="color: #888; font-size: 12px;">وقت الطلب:</span>
                   <span style="font-weight: 800; font-size: 14px;">${new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
             </div>
          </div>
        </div>

        <!-- Items Table -->
        <div style="margin-bottom: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); border-radius: 15px; overflow: hidden; border: 1px solid #eee;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #1a1a1a; color: white;">
                <th style="padding: 18px 20px; text-align: right; font-size: 12px; font-weight: 900; border-left: 1px solid #333;">تفاصيل المنتج والمواصفات</th>
                <th style="padding: 18px 20px; text-align: center; font-size: 12px; font-weight: 900; border-left: 1px solid #333; width: 80px;">الكمية</th>
                <th style="padding: 18px 20px; text-align: left; font-size: 12px; font-weight: 900; width: 140px;">السعر الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <!-- Summary & Totals -->
        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 300px; background: #1a1a1a; color: white; border-radius: 15px; padding: 25px; box-shadow: 0 15px 35px ${branding.primaryColor}20;">
            ${data.discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 12px; opacity: 0.7;">
                <span>المجموع الفرعي</span>
                <span>${(finalTotal + data.discountAmount).toLocaleString()} د.ج</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 12px; color: #4ade80; font-weight: bold;">
                <span>إجمالي الخصم</span>
                <span>- ${data.discountAmount.toLocaleString()} د.ج</span>
              </div>
              <div style="border-top: 1px solid #333; margin-bottom: 15px;"></div>
            ` : ""}
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 14px; font-weight: bold; opacity: 0.8;">المبلغ المطلوب</span>
              <span style="font-size: 28px; font-weight: 900; color: ${branding.primaryColor};">${finalTotal.toLocaleString()} <span style="font-size: 14px;">د.ج</span></span>
            </div>
          </div>
        </div>

        ${data.notes ? `
          <div style="margin-top: 40px; background: #fffbeb; border-right: 4px solid #fcd34d; border-radius: 0 8px 8px 0; padding: 20px;">
            <div style="font-size: 11px; font-weight: 900; color: #92400e; text-transform: uppercase; margin-bottom: 8px;">ملاحظات خاصة:</div>
            <div style="color: #78350f; font-weight: 600; line-height: 1.8;">${data.notes}</div>
          </div>
        ` : ""}

        <!-- Modern Footer -->
        <div style="margin-top: 60px; text-align: center; border-top: 1px solid #eee; padding-top: 30px;">
           <div style="font-size: 18px; font-weight: 900; color: ${branding.primaryColor};">${branding.storeName}</div>
           <div style="font-size: 11px; color: #aaa; margin-top: 8px;">هذا وصل طلب رسمي ومعتمد للأغراض التجارية والإنتاجية</div>
           <div style="display: flex; justify-content: center; gap: 20px; margin-top: 15px;">
              <div style="font-size: 10px; color: #888;">✔ جودة مضمونة</div>
              <div style="font-size: 10px; color: #888;">✔ توصيل سريع</div>
              <div style="font-size: 10px; color: #888;">✔ دعم فني متواصل</div>
           </div>
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
    
    const { error: uploadError } = await supabase.storage
      .from("orders")
      .upload(fileName, pdfBlob, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("orders")
      .getPublicUrl(fileName);

    const downloadName = `${branding.storeName.replace(/\s+/g, '-')}-Receipt-${shortId}.pdf`;
    return `${publicUrlData.publicUrl}?download=${downloadName}`;
  } catch (err: any) {
    console.error("PDF Generate/Upload Error:", err);
    if (typeof window !== "undefined") {
      alert("فشل إنشاء الوصل الاحترافي: " + (err.message || "خطأ غير معروف"));
    }
    throw err;
  } finally {
    if (container && document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
}
