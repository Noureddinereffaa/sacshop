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
      
      const customVars = item.custom_variant_selections || item.custom_variants;
      if (customVars) {
        Object.entries(customVars).forEach(([k, v]) => {
          if (v) details.push(`${k}: ${v}`);
        });
      }
      return details.length > 0 ? `<div style="font-size: 10px; color: #777; margin-top: 5px; font-weight: 500;">${details.join(" | ")}</div>` : "";
    };

    let itemsHtml = "";
    if (isCartOrder && data.cartItems) {
      itemsHtml = data.cartItems.map((item, i) => `
        <tr style="border-bottom: 2px solid #f8f8f8;">
          <td style="padding: 16px 20px; text-align: right; vertical-align: top;">
            <div style="font-weight: 800; font-size: 14px; color: #111;">${i + 1}. ${item.name}</div>
            ${renderDetails(item)}
          </td>
          <td style="padding: 16px 15px; text-align: center; vertical-align: middle; font-weight: 700; color: #444; border-right: 1px solid #f5f5f5;">${item.price.toLocaleString()} دج</td>
          <td style="padding: 16px 15px; text-align: center; vertical-align: middle; font-weight: 700; color: #444; border-right: 1px solid #f5f5f5;">${item.quantity}</td>
          <td style="padding: 16px 20px; text-align: left; vertical-align: middle; font-weight: 900; color: ${branding.primaryColor}; font-size: 16px;">
            ${(item.price * item.quantity).toLocaleString()} <span style="font-size: 10px;">دج</span>
          </td>
        </tr>
      `).join("");
    } else {
      const unitPrice = data.quantity > 0 ? data.productPrice / data.quantity : data.productPrice;
      itemsHtml = `
        <tr style="background: white;">
          <td style="padding: 25px 20px; text-align: right; vertical-align: top;">
            <div style="font-weight: 900; font-size: 17px; color: #111; margin-bottom: 6px;">${data.productName}</div>
            <div style="display: flex; flex-wrap: wrap; gap: 8px; font-size: 11px; color: #666;">
               ${data.selectedSize ? `<span style="background: #f0f9ff; color: ${branding.primaryColor}; padding: 3px 10px; border-radius: 6px; border: 1px solid ${branding.primaryColor}20; font-weight: 700;">المقاس: ${data.selectedSize}</span>` : ""}
               ${data.selectedColor ? `<span style="background: #f0f9ff; color: ${branding.primaryColor}; padding: 3px 10px; border-radius: 6px; border: 1px solid ${branding.primaryColor}20; font-weight: 700;">اللون: ${data.selectedColor}</span>` : ""}
               ${data.numColors ? `<span style="background: #f0f9ff; color: ${branding.primaryColor}; padding: 3px 10px; border-radius: 6px; border: 1px solid ${branding.primaryColor}20; font-weight: 700;">طباعة: ${data.numColors} ألوان ${data.isDoubleSided ? '(جهتين)' : '(جهة واحدة)'}</span>` : ""}
            </div>
            ${data.customVariantSelections ? `
              <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid #f5f5f5; display: flex; gap: 8px; flex-wrap: wrap;">
                ${Object.entries(data.customVariantSelections)
                  .filter(([_, v]) => v)
                  .map(([k, v]) => `<span style="font-size: 10px; background: #fafafa; border: 1px solid #eee; padding: 3px 8px; border-radius: 6px; color: #777;"><b>${k}:</b> ${v}</span>`).join("")}
              </div>
            ` : ""}
          </td>
          <td style="padding: 25px 15px; text-align: center; vertical-align: middle; font-weight: 800; font-size: 16px; color: #444; border-right: 1px solid #f5f5f5;">${unitPrice.toLocaleString()} <span style="font-size: 9px; opacity: 0.6;">دج</span></td>
          <td style="padding: 25px 15px; text-align: center; vertical-align: middle; font-weight: 800; font-size: 18px; border-right: 1px solid #f5f5f5;">${data.quantity}</td>
          <td style="padding: 25px 20px; text-align: left; vertical-align: middle; font-weight: 900; font-size: 22px; color: ${branding.primaryColor};">
            ${data.productPrice.toLocaleString()} <span style="font-size: 12px;">دج</span>
          </td>
        </tr>
      `;
    }

    container.innerHTML = `
      <div style="padding: 50px; background: #fff;">
        <!-- Luxury Header Section -->
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 50px; border-bottom: 5px solid ${branding.primaryColor}; padding-bottom: 25px;">
          <div>
            ${branding.logo ? `<img src="${branding.logo}" style="max-height: 85px; margin-bottom: 15px; display: block;" />` : `<div style="font-size: 36px; font-weight: 900; color: ${branding.primaryColor}; margin-bottom: 5px;">${branding.storeName}</div>`}
            <div style="font-size: 13px; color: #666; font-weight: 600;">أفضل خدمات الطباعة والتغليف في الجزائر</div>
          </div>
          <div style="text-align: left;">
            <div style="font-size: 56px; font-weight: 900; color: #f5f5f5; margin-top: -20px; text-transform: uppercase;">وصل طلب</div>
            <div style="background: ${branding.primaryColor}; color: white; padding: 12px 24px; border-radius: 12px; display: inline-block; margin-top: -15px; position: relative; z-index: 1; box-shadow: 0 8px 20px ${branding.primaryColor}30;">
              <div style="font-size: 10px; opacity: 0.9; font-weight: 900; margin-bottom: 4px; uppercase; letter-spacing: 1px;">رقم الطلب الرسمي</div>
              <div style="font-size: 24px; font-weight: 900; letter-spacing: 2px;">#${shortId}</div>
            </div>
          </div>
        </div>

        <!-- Billing Details Grid -->
        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 35px; margin-bottom: 45px;">
          <div style="background: #fdfdfd; border-radius: 15px; padding: 25px; border: 1px solid #f0f0f0; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
             <div style="font-size: 12px; font-weight: 900; color: ${branding.primaryColor}; text-transform: uppercase; margin-bottom: 18px; border-bottom: 2px solid ${branding.primaryColor}15; padding-bottom: 6px;">بيانات العميل المستلم</div>
             <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                   <span style="color: #666; font-size: 13px; font-weight: 600;">اسم العميل:</span>
                   <span style="font-weight: 800; font-size: 15px; color: #111;">${data.customerName}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                   <span style="color: #666; font-size: 13px; font-weight: 600;">رقم الهاتف:</span>
                   <span style="font-weight: 800; font-size: 15px; color: #111; direction: ltr;">${data.customerPhone}</span>
                </div>
             </div>
          </div>
          <div style="background: #fdfdfd; border-radius: 15px; padding: 25px; border: 1px solid #f0f0f0; box-shadow: 0 4px 12px rgba(0,0,0,0.02);">
             <div style="font-size: 12px; font-weight: 900; color: ${branding.primaryColor}; text-transform: uppercase; margin-bottom: 18px; border-bottom: 2px solid ${branding.primaryColor}15; padding-bottom: 6px;">تفاصيل السجل</div>
             <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                   <span style="color: #666; font-size: 13px; font-weight: 600;">تاريخ الإنشاء:</span>
                   <span style="font-weight: 800; font-size: 15px; color: #111;">${new Date().toLocaleDateString("ar-DZ")}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                   <span style="color: #666; font-size: 13px; font-weight: 600;">وقت الطلب:</span>
                   <span style="font-weight: 800; font-size: 15px; color: #111;">${new Date().toLocaleTimeString("ar-DZ", { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
             </div>
          </div>
        </div>

        <!-- Items Table -->
        <div style="margin-bottom: 45px; box-shadow: 0 15px 40px rgba(0,0,0,0.04); border-radius: 20px; overflow: hidden; border: 1px solid #eee;">
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #111; color: white;">
                <th style="padding: 22px 20px; text-align: right; font-size: 13px; font-weight: 900; border-left: 1px solid #222;">تفاصيل المنتج والمواصفات</th>
                <th style="padding: 22px 15px; text-align: center; font-size: 13px; font-weight: 900; border-left: 1px solid #222; width: 100px;">سعر القطعة</th>
                <th style="padding: 22px 15px; text-align: center; font-size: 13px; font-weight: 900; border-left: 1px solid #222; width: 80px;">الكمية</th>
                <th style="padding: 22px 20px; text-align: left; font-size: 13px; font-weight: 900; width: 160px;">السعر الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
        </div>

        <!-- Summary & Totals -->
        <div style="display: flex; justify-content: flex-end;">
          <div style="width: 320px; background: #111; color: white; border-radius: 20px; padding: 30px; box-shadow: 0 20px 40px ${branding.primaryColor}20;">
            ${data.discountAmount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 14px; font-size: 13px; opacity: 0.7; font-weight: 600;">
                <span>المجموع الفرعي</span>
                <span>${(finalTotal + data.discountAmount).toLocaleString()} دج</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 18px; font-size: 13px; color: #4ade80; font-weight: 800;">
                <span>إجمالي الخصم المطبق</span>
                <span>- ${data.discountAmount.toLocaleString()} دج</span>
              </div>
              <div style="border-top: 1px solid #222; margin-bottom: 18px;"></div>
            ` : ""}
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 16px; font-weight: 900; opacity: 0.9;">المبلغ المطلوب</span>
              <span style="font-size: 32px; font-weight: 900; color: ${branding.primaryColor};">${finalTotal.toLocaleString()} <span style="font-size: 14px;">دج</span></span>
            </div>
          </div>
        </div>

        ${data.notes ? `
          <div style="margin-top: 45px; background: #fffcf0; border-right: 5px solid #fbbf24; border-radius: 4px 15px 15px 4px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.02);">
            <div style="font-size: 12px; font-weight: 900; color: #b45309; text-transform: uppercase; margin-bottom: 10px; display: flex; items-center gap: 8px;">
               <span style="display: inline-block; width: 6px; height: 6px; background: #b45309; border-radius: 50%;"></span>
               ملاحظات فريق العمل والطباعة:
            </div>
            <div style="color: #92400e; font-weight: 700; line-height: 1.8; font-size: 14px;">${data.notes}</div>
          </div>
        ` : ""}

        <!-- Modern Footer -->
        <div style="margin-top: 80px; text-align: center; border-top: 2px solid #f5f5f5; padding-top: 40px;">
           <div style="font-size: 22px; font-weight: 900; color: ${branding.primaryColor}; margin-bottom: 12px; letter-spacing: 1px;">${branding.storeName}</div>
           <div style="font-size: 12px; color: #999; font-weight: 600;">هذا الوصل وثيقة رسمية معتمدة لخدمات الطباعة وسير السكاكين</div>
           <div style="display: flex; justify-content: center; gap: 30px; margin-top: 25px;">
              <div style="font-size: 11px; color: #777; display: flex; align-items: center; gap: 6px;"><span style="color: ${branding.primaryColor};">✔</span> جودة مضمونة 100%</div>
              <div style="font-size: 11px; color: #777; display: flex; align-items: center; gap: 6px;"><span style="color: ${branding.primaryColor};">✔</span> توصيل لـ 58 ولاية</div>
              <div style="font-size: 11px; color: #777; display: flex; align-items: center; gap: 6px;"><span style="color: ${branding.primaryColor};">✔</span> دعم فني 24/7</div>
           </div>
           <div style="margin-top: 30px; font-size: 10px; color: #ccc;">Powered by Antigravity Agency</div>
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

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculate PDF dimensions - Keep standard A4 width (595.28pt) but use dynamic height
    const pdfWidth = 595.28;
    const pdfHeight = (canvasHeight * pdfWidth) / canvasWidth;

    // Create PDF with custom dimensions to avoid clipping
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [pdfWidth, pdfHeight]
    });

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
