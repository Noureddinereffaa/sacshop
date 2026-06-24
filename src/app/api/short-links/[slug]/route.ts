import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://serviceserigraphie.com").replace(/\/+$/, "");

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/['"]/g, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim().replace(/['"]/g, "");
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sb = getAdminSupabase();

  if (!sb) {
    return NextResponse.redirect(`${SITE_URL}/`, 302);
  }

  const { data, error } = await sb
    .from("short_links")
    .select("destination, clicks")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.redirect(`${SITE_URL}/`, 302);
  }

  // Fire-and-forget click increment
  sb.from("short_links")
    .update({ clicks: data.clicks + 1 })
    .eq("slug", slug)
    .then(() => {});

  const userAgent = req.headers.get("user-agent") || "";
  const isFacebookApp = /FBAN|FBAV|Instagram|Mobile\/FB/i.test(userAgent);

  if (isFacebookApp) {
    return NextResponse.redirect(`${SITE_URL}/go/${slug}`, 302);
  }

  return NextResponse.redirect(data.destination, 302);
}
