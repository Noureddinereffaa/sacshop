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
    // Fallback: redirect to homepage if DB is unavailable
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  // Fetch the link and increment clicks atomically
  const { data, error } = await sb
    .from("short_links")
    .select("destination, clicks")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    // Slug not found → redirect to homepage gracefully
    return NextResponse.redirect(new URL("/", req.url), 302);
  }

  // Fire-and-forget click increment (don't await — keeps redirect < 50ms)
  sb.from("short_links")
    .update({ clicks: data.clicks + 1 })
    .eq("slug", slug)
    .then(() => {});

  // 302 temporary redirect (Facebook follows 302 redirects instantly)
  return NextResponse.redirect(data.destination, 302);
}
