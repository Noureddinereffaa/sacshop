import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

// Server component — reads WhatsApp message from DB and builds a secure redirect page
export default async function OrderConfirmPage({ params }: { params: { id: string } }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: order } = await supabase
    .from("orders")
    .select("id, admin_notes, customer_name")
    .eq("id", params.id)
    .single();

  if (!order) return notFound();

  // Extract secure WhatsApp message stored at time of order creation
  let waLink = `https://wa.me/213000000000?text=${encodeURIComponent("مرحباً، أود الاستفسار عن طلبي")}`;

  if (order.admin_notes) {
    const msgMatch = order.admin_notes.match(
      /__wa_message__:\n([\s\S]*?)\n__wa_number__:([0-9]+)/
    );
    if (msgMatch) {
      const message = msgMatch[1].trim();
      const number = msgMatch[2].trim();
      waLink = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    }
  }

  // Render a mobile-friendly page that auto-opens WhatsApp
  // We use a client-side redirect via meta refresh AND a visible button as fallback
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Auto-redirect to WhatsApp after 1.5 seconds */}
        <meta httpEquiv="refresh" content={`1; url=${waLink}`} />
        <title>تأكيد الطلب — يتم فتح واتساب...</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { 
            font-family: 'Segoe UI', Tahoma, sans-serif; 
            background: #f0fdf4; 
            min-height: 100vh; 
            display: flex; align-items: center; justify-content: center;
            padding: 24px;
          }
          .card {
            background: white;
            border-radius: 24px;
            padding: 40px 32px;
            text-align: center;
            max-width: 420px;
            width: 100%;
            box-shadow: 0 10px 40px rgba(0,0,0,0.08);
            border: 1px solid #dcfce7;
          }
          .icon {
            width: 80px; height: 80px;
            background: #dcfce7; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 24px;
            font-size: 40px;
          }
          h1 { font-size: 22px; font-weight: 900; color: #111; margin-bottom: 12px; }
          p { color: #6b7280; font-size: 15px; line-height: 1.6; margin-bottom: 28px; }
          .btn {
            display: flex; align-items: center; justify-content: center; gap: 10px;
            background: #25D366;
            color: white;
            text-decoration: none;
            border-radius: 16px;
            padding: 18px 24px;
            font-size: 18px;
            font-weight: 900;
            width: 100%;
            box-shadow: 0 4px 16px rgba(37,211,102,0.3);
            -webkit-tap-highlight-color: transparent;
            transition: transform 0.1s;
          }
          .btn:active { transform: scale(0.97); }
          .hint { font-size: 12px; color: #9ca3af; margin-top: 16px; margin-bottom: 0; }
        `}</style>
      </head>
      <body>
        <div className="card">
          <div className="icon">✅</div>
          <h1>تم تسجيل طلبك!</h1>
          <p>
            سيتم فتح واتساب تلقائياً خلال ثوانٍ لتأكيد طلبك مع فريقنا.
            إذا لم يفتح تلقائياً، اضغط الزر أدناه.
          </p>
          <a href={waLink} className="btn">
            <span>💬</span>
            <span>فتح واتساب والتأكيد</span>
          </a>
          <p className="hint">سيتم فتح تطبيق واتساب المثبت على هاتفك</p>
        </div>
      </body>
    </html>
  );
}
