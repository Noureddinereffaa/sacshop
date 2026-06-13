import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/['"]/g, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/['"]/g, "");
  if (!url || !key) return null;
  return createClient(url, key);
}

/** Generate a short random slug like "p-a3k9" */
function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let slug = "p-";
  for (let i = 0; i < 5; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

// GET  /api/short-links  → list all short links
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

// POST /api/short-links  → create a new short link
export async function POST(req: NextRequest) {
  const sb = getAdminSupabase();
  if (!sb) return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });

  const body = await req.json();
  const { product_id, product_name, destination } = body;

  if (!product_id || !product_name || !destination) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Generate a unique slug (retry up to 5 times on collision)
  let slug = "";
  for (let attempt = 0; attempt < 5; attempt++) {
    slug = generateSlug();
    const { data: existing } = await sb
      .from("short_links")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!existing) break;
  }

  const { data, error } = await sb
    .from("short_links")
    .insert({ slug, product_id, product_name, destination })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

// DELETE /api/short-links?id=xxx  → delete a short link
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
