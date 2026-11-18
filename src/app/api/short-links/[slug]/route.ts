import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminSafe } from "@/lib/supabaseAdmin";
import { SITE_URL } from "@/lib/siteUrl";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sb = getSupabaseAdminSafe();

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
