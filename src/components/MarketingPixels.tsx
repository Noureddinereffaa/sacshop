"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Declare global types for pixel SDKs
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    ttq?: { load: (id: string) => void; track: (event: string, data?: object) => void; page: () => void };
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    // Our custom tracking helper used by OrderForm
    trackMarketingEvent?: (event: "ViewContent" | "SubmitOrder" | "Purchase", data?: Record<string, unknown>) => void;
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

        const fbPixelId = settings.marketing?.fbPixelId;
        const tiktokId = settings.marketing?.tiktokPixelId;
        const gaId = settings.marketing?.googleAnalyticsId;

        // ── Facebook Pixel ─────────────────────────────────────
        if (fbPixelId) {
          (function (f: Window & typeof globalThis, b: Document, _e: string, v: string) {
            if (f.fbq) return;
            const n = function (...args: unknown[]) {
              (n as unknown as { callMethod?: (...a: unknown[]) => void; queue: unknown[] }).callMethod
                ? (n as unknown as { callMethod: (...a: unknown[]) => void }).callMethod(...args)
                : ((n as unknown as { queue: unknown[] }).queue =
                    (n as unknown as { queue: unknown[] }).queue || []).push(args);
            };
            f.fbq = n;
            if (!f._fbq) f._fbq = n;
            const t = b.createElement("script") as HTMLScriptElement;
            t.async = true;
            t.src = v;
            b.head.appendChild(t);
          })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
          window.fbq?.("init", fbPixelId);
          window.fbq?.("track", "PageView");
        }

        // ── TikTok Pixel ───────────────────────────────────────
        if (tiktokId) {
          const script = document.createElement("script");
          script.async = true;
          script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${tiktokId}`;
          script.charset = "UTF-8";
          script.setAttribute("crossorigin", "*");
          script.onload = () => {
            window.ttq?.load(tiktokId);
            window.ttq?.page();
          };
          document.head.appendChild(script);
        }

        // ── Google Analytics (gtag) ────────────────────────────
        if (gaId) {
          const script = document.createElement("script");
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
          document.head.appendChild(script);

          window.dataLayer = window.dataLayer || [];
          window.gtag = function (...args: unknown[]) { window.dataLayer!.push(args); };
          window.gtag("js", new Date());
          window.gtag("config", gaId);
        }

        // ── Global trackMarketingEvent helper ─────────────────
        // Called by OrderForm on SubmitOrder / Purchase
        window.trackMarketingEvent = (event, data = {}) => {
          // FB
          if (fbPixelId && window.fbq) {
            window.fbq("track", event, data);
          }
          // TikTok
          if (tiktokId && window.ttq) {
            window.ttq.track(event, data);
          }
          // GA4
          if (gaId && window.gtag) {
            window.gtag("event", event.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, ""), data);
          }
        };

      } catch {
        // Silently fail — pixels are non-critical
      }
    }

    loadPixels();
  }, []);

  return null;
}
