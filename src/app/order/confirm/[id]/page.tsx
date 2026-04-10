import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

// This is a SERVER component - user cannot inspect or modify the WhatsApp message
export default async function OrderConfirmPage({ params }: { params: { id: string } }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: order } = await supabase
    .from("orders")
    .select("id, admin_notes, customer_name, customer_phone")
    .eq("id", params.id)
    .single();

  // Extract WhatsApp message and number stored securely in admin_notes
  let waLink = `https://wa.me/213000000000`; // fallback
  const fallbackMsg = `مرحباً، أود الاستفسار عن طلبي.`;

  if (order?.admin_notes) {
    const msgMatch = order.admin_notes.match(/__wa_message__:\n([\s\S]*?)\n__wa_number__:([0-9]+)/);
    if (msgMatch) {
      const message = msgMatch[1].trim();
      const number = msgMatch[2].trim();
      waLink = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
    }
  }

  // Server-side redirect directly to WhatsApp — client never sees the message text
  redirect(waLink);
}
