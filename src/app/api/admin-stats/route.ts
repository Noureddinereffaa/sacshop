import { NextResponse, NextRequest } from "next/server";
import { getSupabaseAdminSafe } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/adminAuth";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  const sb = getSupabaseAdminSafe();
  if (!sb) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const [ordersRes, productsRes, customersRes] = await Promise.all([
    sb.from("orders").select("*"),
    sb.from("products").select("id").eq("is_published", true),
    sb.from("customers").select("id, is_vip"),
  ]);

  if (ordersRes.error) {
    console.error("[Admin Stats] orders error:", ordersRes.error.message, ordersRes.error.code);
  }
  if (productsRes.error) {
    console.error("[Admin Stats] products error:", productsRes.error.message, productsRes.error.code);
  }
  if (customersRes.error) {
    console.error("[Admin Stats] customers error:", customersRes.error.message, customersRes.error.code);
  }

  return NextResponse.json({
    orders: ordersRes.data || [],
    products: productsRes.data || [],
    customers: customersRes.data || [],
  });
}
