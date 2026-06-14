import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  const { data, error } = await sb
    .from("short_links")
    .select("destination, clicks")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  // Fire-and-forget click increment
  sb.from("short_links")
    .update({ clicks: data.clicks + 1 })
    .eq("slug", slug)
    .then(() => {});

  const userAgent = req.headers.get("user-agent") || "";
  const isFacebookApp = /FBAN|FBAV|Instagram/i.test(userAgent);

  if (isFacebookApp) {
    // Redirect to the landing page for Facebook/Instagram in-app browsers
    const origin = new URL(req.url).origin;
    return NextResponse.redirect(`${origin}/go/${slug}`, 302);
  }

  // Normal fast 302 redirect for native browsers
  return NextResponse.redirect(data.destination, 302);
}
