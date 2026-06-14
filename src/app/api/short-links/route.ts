import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://serviceserigraphie.com").replace(/\/+$/, "");

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/['"]/g, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/['"]/g, "");
  if (!url || !key) return null;
  return createClient(url, key);
}

function generateSlug(type: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const prefix = type === "category" ? "c-" : "p-";
  let slug = prefix;
  for (let i = 0; i < 5; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

export async function GET() {
  const sb = getAdminSupabase();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const { data, error } = await sb
    .from("short_links")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: NextRequest) {
  const sb = getAdminSupabase();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await req.json();
  const { product_id, product_name, product_image, destination, type, category_name } = body;

  if (!product_id || !product_name) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const linkType = type === "category" ? "category" : "product";

  // Build destination server-side - never trust client
  let finalDestination: string;
  if (linkType === "category") {
    finalDestination = `${SITE_URL}/products?category=${encodeURIComponent(category_name || product_name)}`;
  } else {
    finalDestination = `${SITE_URL}/products/${product_id}`;
  }

  const safeImage = product_image ? product_image.replace(/^http:\/\//, "https://") : null;

  let slug = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    slug = generateSlug(linkType);
    const { data: existing } = await sb
      .from("short_links")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
  }

  const { data, error } = await sb
    .from("short_links")
    .insert({
      slug,
      product_id,
      product_name,
      product_image: safeImage,
      destination: finalDestination,
      type: linkType,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function DELETE(req: NextRequest) {
  const sb = getAdminSupabase();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const { error } = await sb.from("short_links").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
