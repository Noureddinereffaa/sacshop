"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Declare global types for pixel SDKs
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    ttq?: { load: (id: string) => void; track: (event: string) => void };
  }
}

export default function MarketingPixels() {
  useEffect(() => {
    if (!supabase) return;

    async function loadPixels() {
      try {
        const { data } = await supabase!.from("settings").select("*");
        const settings = (data || []).reduce(
          (acc: Record<string, unknown>, s: { key: string; value: unknown }) => ({ ...acc, [s.key]: s.value }),
          {}
        ) as Record<string, Record<string, string>>;

        // Facebook Pixel
        if (settings.marketing?.fbPixelId) {
          const fbPixelId = settings.marketing.fbPixelId;
          (function (
            f: Window & typeof globalThis,
            b: Document,
            e: string,
            v: string
          ) {
            if (f.fbq) return;
            const n = function (...args: unknown[]) {
              (n as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] }).callMethod
                ? (n as unknown as { callMethod: (...a: unknown[]) => void }).callMethod(...args)
                : ((n as unknown as { queue: unknown[] }).queue = (n as unknown as { queue: unknown[] }).queue || []).push(args);
            };
            f.fbq = n;
            if (!f._fbq) f._fbq = n;
            const t = b.createElement(e) as HTMLScriptElement;
            t.async = true;
            t.src = v;
            const s = b.getElementsByTagName(e)[0];
            s.parentNode?.insertBefore(t, s);
          })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
          window.fbq?.("init", fbPixelId);
          window.fbq?.("track", "PageView");
        }

        // TikTok Pixel
        const tiktokId = settings.marketing?.tiktokPixelId;
        if (tiktokId) {
          const script = document.createElement("script");
          script.async = true;
          script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${settings.marketing.tiktokPixelId}`;
          script.charset = "UTF-8";
          script.setAttribute("crossorigin", "*");
          document.head.appendChild(script);
        }
      } catch (e) {
        // Silently fail - pixels are non-critical
      }
    }

    loadPixels();
  }, []);

  return null;
}
