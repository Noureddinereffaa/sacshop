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

  // Fire-and-forget click increment (don't await — keeps redirect fast)
  sb.from("short_links")
    .update({ clicks: data.clicks + 1 })
    .eq("slug", slug)
    .then(() => {});

  const userAgent = req.headers.get("user-agent") || "";
  const isFacebookApp = /FBAN|FBAV|Instagram/i.test(userAgent);

  if (isFacebookApp) {
    // ── Breakout for Facebook / Instagram In-App Browsers ──
    const destinationUrl = data.destination;
    const cleanUrl = destinationUrl.replace(/^https?:\/\//, "");

    const html = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>جاري التوجيه...</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6; color: #1f2937; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; padding: 20px; box-sizing: border-box; }
        .card { background: white; padding: 30px 20px; border-radius: 24px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 400px; width: 100%; border: 1px solid #e5e7eb; text-align: center; }
        .icon-wrapper { width: 64px; height: 64px; background: #eef2ff; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; }
        h1 { font-size: 1.25rem; font-weight: 900; margin: 0 0 10px; }
        p { font-size: 0.95rem; color: #4b5563; margin: 0 0 20px; line-height: 1.6; }
        .instruction { background: #fefce8; color: #854d0e; padding: 15px; border-radius: 16px; font-size: 0.95rem; text-align: right; border: 1px solid #fef08a; }
        .dots { display: inline-flex; background: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 8px; font-weight: 900; letter-spacing: 2px; }
        .loader { border: 3px solid #eef2ff; border-top: 3px solid #4f46e5; border-radius: 50%; width: 28px; height: 28px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .btn { display: block; background: #4f46e5; color: white; text-decoration: none; padding: 14px 24px; border-radius: 14px; font-weight: 900; width: 100%; box-sizing: border-box; transition: background 0.2s; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="loader" id="loader"></div>
        <h1>مرحباً بك! 👋</h1>
        <p>متصفح فيسبوك لا يدعم بعض الميزات.<br/>لتجربة تسوق أفضل وأسرع، يرجى فتح الصفحة في متصفح هاتفك الأساسي.</p>
        
        <div class="instruction">
          <strong>خطوة بسيطة:</strong><br/>
          1. اضغط على النقاط الثلاث <span class="dots">•••</span> في الأعلى.<br/>
          2. اختر <strong>"فتح في المتصفح"</strong><br/>
          <span style="display:inline-block; margin-top:4px; font-size:0.85em; opacity:0.8">(أو Open in Browser)</span>
        </div>
        
        <a href="${destinationUrl}" class="btn" id="fallbackBtn" style="display: none;">الاستمرار على أي حال</a>
      </div>
      <script>
        var isAndroid = /Android/i.test(navigator.userAgent);
        var dest = "${destinationUrl}";
        var cleanUrl = "${cleanUrl}";
        
        if (isAndroid) {
          // Automatic breakout attempt for Android (forces Chrome)
          var intentUrl = "intent://" + cleanUrl + "#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=" + encodeURIComponent(dest) + ";end";
          window.location.replace(intentUrl);
        } else {
          // iOS users must tap the dots manually, but we show a fallback button after 2 seconds
          setTimeout(function() {
            document.getElementById('loader').style.display = 'none';
            document.getElementById('fallbackBtn').style.display = 'block';
          }, 2000);
        }
      </script>
    </body>
    </html>
    `;

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // Tell caching layers not to cache the breakout page because it depends on the user-agent
        "Cache-Control": "no-store, max-age=0",
      },
    });
  }

  // ── Normal fast 302 redirect for native browsers ──
  return NextResponse.redirect(data.destination, 302);
}
