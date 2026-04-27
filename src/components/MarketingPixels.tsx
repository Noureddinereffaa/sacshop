"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useSettingsStore } from "@/store/settingsStore";

// Declare global types for pixel SDKs
declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    ttq?: { load: (id: string) => void; track: (event: string, data?: object) => void; page: () => void };
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    // Our custom tracking helper used by OrderForm
    trackMarketingEvent?: (event: "ViewContent" | "SubmitOrder" | "Purchase" | "AddToCart" | "InitiateCheckout" | "Contact", data?: Record<string, unknown>) => void;
  }
}

export default function MarketingPixels() {
  const { marketing, isLoaded } = useSettingsStore();

  const fbPixelId = marketing?.fbPixelId || "26614569358191911";
  const tiktokId = marketing?.tiktokPixelId || "D7L9ISRC77U8CJLL7AFG";
  const gaId = marketing?.googleAnalyticsId;

  useEffect(() => {
    if (!isLoaded) return;

    // Capture UTM parameters and save them for 30 days
    try {
      const params = new URLSearchParams(window.location.search);
      const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'ttclid'];
      let utmData = JSON.parse(localStorage.getItem('marketing_utms') || '{}');
      let hasNewUtms = false;
      
      utmParams.forEach(param => {
        if (params.has(param)) {
          utmData[param] = params.get(param);
          hasNewUtms = true;
        }
      });
      
      if (hasNewUtms) {
        utmData.captured_at = new Date().toISOString();
        localStorage.setItem('marketing_utms', JSON.stringify(utmData));
      }
    } catch (e) {
      console.error("Error saving UTM params", e);
    }

    // ── Global trackMarketingEvent helper ─────────────────
    // Called by OrderForm, QuickAdd, Product Detail
    window.trackMarketingEvent = (event, data = {}) => {
      console.log(`[Tracking Event] ${event}`, data);
      // FB
      if (fbPixelId && window.fbq) {
        const fbEventMap: Record<string, string> = {
          SubmitOrder: "Lead", // Optimize COD form submissions as Leads
        };
        const fbEvent = fbEventMap[event] || event;
        window.fbq("track", fbEvent, data);
      }
      // TikTok
      if (tiktokId && window.ttq) {
        const ttEventMap: Record<string, string> = {
          SubmitOrder: "PlaceAnOrder", // Standard TikTok event for order submission
        };
        const ttEvent = ttEventMap[event] || event;
        window.ttq.track(ttEvent, data);
      }
      // GA4
      if (gaId && window.gtag) {
        const gaEventMap: Record<string, string> = {
          ViewContent: "view_item",
          AddToCart: "add_to_cart",
          InitiateCheckout: "begin_checkout",
          SubmitOrder: "generate_lead", // Or "purchase" depending on strategy, but leads are common for COD
          Purchase: "purchase"
        };
        const gaEvent = gaEventMap[event] || event.replace(/([A-Z])/g, "_$1").toLowerCase().replace(/^_/, "");
        window.gtag("event", gaEvent, {
          ...data,
          items: (data as any).content_ids?.map((id: string) => ({ item_id: id })) || []
        });
      }
    };
  }, [isLoaded, fbPixelId, tiktokId, gaId]);

  if (!isLoaded) return null;

  return (
    <>
      {fbPixelId && (
        <>
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${fbPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img 
              height="1" 
              width="1" 
              style={{ display: 'none' }}
              src={`https://www.facebook.com/tr?id=${fbPixelId}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      )}

      {tiktokId && (
        <Script
          id="tiktok-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function (w, d, t) {
                w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=i+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
                ttq.load('${tiktokId}');
                ttq.page();
              }(window, document, 'ttq');
            `,
          }}
        />
      )}

      {gaId && (
        <>
          <Script id="ga-base" strategy="afterInteractive" src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
          <Script
            id="ga-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `,
            }}
          />
        </>
      )}
    </>
  );
}
