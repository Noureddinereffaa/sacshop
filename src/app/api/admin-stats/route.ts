import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/['"]/g, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/['"]/g, "");
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET() {
  const sb = getAdminSupabase();
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
