"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail(name: string, email: string, orderNumber: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "SacShop <onboarding@resend.dev>", // Replace with verified domain
      to: email,
      subject: `تأكيد طلبك رقم ${orderNumber} | SacShop`,
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; padding: 40px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <div style="background-color: #4a7c7c; padding: 40px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 24px;">شكراً لتسوقك مع SacShop!</h1>
            </div>
            <div style="padding: 40px; color: #333; line-height: 1.6;">
              <p>مرحباً <strong>${name}</strong>،</p>
              <p>لقد استلمنا طلبك رقم <strong>#${orderNumber}</strong> بنجاح. سنقوم بمراجعة الطلب والتواصل معك قريباً لتأكيده وشحنه.</p>
              
              <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #64748b;">رابط تتبع الطلب:</p>
                <a href="https://sacshop.dz/track/${orderNumber}" style="color: #4a7c7c; font-weight: bold; text-decoration: none; font-size: 18px;">اضغط هنا لمتابعة طلبك</a>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 40px;">
                إذا كان لديك أي استفسار، لا تتردد في مراسلتنا عبر الواتساب.
              </p>
            </div>
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
            © 2026 SacShop الجزائر. جميع الحقوق محفوظة.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend Email Error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Resend Catch Error:", error);
    return { success: false, error };
  }
}
