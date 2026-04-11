import { NextResponse } from "next/server";
import { Resend } from "resend";

// تهيئة Resend بمفتاح من متغيرات البيئة
const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, orderNumber, customerName, customerEmail, status, totalPrice } = body;

    if (!customerEmail) {
      return NextResponse.json({ success: false, error: "No email provided" }, { status: 400 });
    }

    if (!resend) {
      console.log("[EMAIL SIMULATION] Would have sent email to:", customerEmail, "Status:", status);
      return NextResponse.json({ 
        success: true, 
        message: "Email simulated (RESEND_API_KEY missing)" 
      });
    }

    let subject = "";
    let htmlContent = "";

    // إنشاء محتوى الإيمايل بناءً على حالة الطلب
    switch (status) {
      case "new":
        subject = "تم استلام طلبك بنجاح محفظة SacShop 🛍️";
        htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; color: #333;">
            <h1 style="color: #00AEEF;">مرحباً ${customerName}،</h1>
            <p>شكراً لتسوقك من متجرنا. لقد استلمنا طلبك رقم <strong>#${orderNumber || orderId.slice(0, 8)}</strong> بنجاح.</p>
            <p>إجمالي الطلب: <strong>${totalPrice} د.ج</strong></p>
            <p>سنتصل بك قريباً لتأكيد الطلب وتحديد موعد التوصيل.</p>
            <br/>
            <p>مع تحيات،<br/>فريق SacShop.dz</p>
          </div>
        `;
        break;

      case "shipped":
        subject = "طلبك في الطريق إليك 🚚";
        htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; color: #333;">
            <h1 style="color: #00AEEF;">مرحباً ${customerName}،</h1>
            <p>نبشرك بأن طلبك رقم <strong>#${orderNumber || orderId.slice(0, 8)}</strong> قد تم تسليمه لشركة التوصيل وهو الآن في الطريق إليك!</p>
            <p>يرجى إبقاء هاتفك مفتوحاً للتواصل معك.</p>
            <br/>
            <p>مع تحيات،<br/>فريق SacShop.dz</p>
          </div>
        `;
        break;

      case "delivered":
        subject = "تم تسليم طلبك بنجاح ✅";
        htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; color: #333;">
            <h1 style="color: #00AEEF;">مرحباً ${customerName}،</h1>
            <p>لقد تم تأكيد تسليم طلبك رقم <strong>#${orderNumber || orderId.slice(0, 8)}</strong>.</p>
            <p>نتمنى أن تكون تجربتك معنا مميزة وأن تكون المنتجات نالت إعجابك.</p>
            <br/>
            <p>لا تنسَ مشاركتنا رأيك!</p>
            <br/>
            <p>مع تحيات،<br/>فريق SacShop.dz</p>
          </div>
        `;
        break;
        
      case "cancelled":
        subject = "تم إلغاء طلبك ❌";
        htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; color: #333;">
            <h1 style="color: #e11d48;">مرحباً ${customerName}،</h1>
            <p>لقد تم إلغاء طلبك رقم <strong>#${orderNumber || orderId.slice(0, 8)}</strong>.</p>
            <p>إذا كان هناك أي خطأ أو أردت طلب منتجات أخرى، يسعدنا تواصلك معنا دائماً.</p>
            <br/>
            <p>مع تحيات،<br/>فريق SacShop.dz</p>
          </div>
        `;
        break;

      default:
        subject = "تحديث بخصوص طلبك من SacShop";
        htmlContent = `
          <div dir="rtl" style="font-family: Arial, sans-serif; text-align: right; color: #333;">
            <h1 style="color: #10a37f;">مرحباً ${customerName}،</h1>
            <p>هناك تحديث جديد بخصوص طلبك رقم <strong>#${orderNumber || orderId.slice(0, 8)}</strong>.</p>
            <p>الحالة الحالية: ${status}</p>
            <br/>
            <p>مع تحيات،<br/>فريق SacShop.dz</p>
          </div>
        `;
    }

    const data = await resend.emails.send({
      from: "SacShop <onboarding@resend.dev>", // يجب تغييره لدومين حقيقي لاحقاً
      to: [customerEmail],
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
