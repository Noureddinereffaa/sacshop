import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import MarketingPixels from "@/components/layout/MarketingPixels";
import SettingsProvider from "@/components/SettingsProvider";
import dynamic from "next/dynamic";
import GlobalNavigation from "@/components/layout/GlobalNavigation";
import Footer from "@/components/layout/Footer";
import { getPopupImageUrl, escapeHtml } from "@/lib/popupImage";

// Lazy-load non-critical components (code-split into separate chunks)
const OfferPopup = dynamic(() => import("@/components/layout/OfferPopup"));
const ScrollToTop = dynamic(() => import("@/components/layout/ScrollToTop"));


const tajawal = Tajawal({
  subsets: ["arabic"],
  // Only load weights actually used - cuts font download by ~40%
  weight: ["400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap", // Show text immediately with fallback font
});

const QuickAddModal = dynamic(() => import("@/components/product/QuickAddModal"));

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF3366",
};

export const revalidate = 60; // Revalidate settings every 60 seconds


import { SITE_URL, resolveSiteUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Service Serigraphie | طباعة أكياس، ملصقات، وتغليف في الجزائر",
  description: "Service Serigraphie - شريكك الأول في الجزائر للطباعة الاحترافية. نحن متخصصون في طباعة الأكياس الورقية والقماشية، الملصقات (Stickers)، وحلول التغليف المخصصة. جودة عالية وتوصيل لـ 58 ولاية.",
  keywords: ["طباعة", "أكياس ورقية", "ملصقات", "تغليف", "سيريغرافي", "الجزائر", "أكياس قماشية", "Service Serigraphie", "printing algeria"],
  authors: [{ name: "Service Serigraphie" }],
  icons: {
    icon: "/favicon.png?v=2",
    apple: "/favicon.png?v=2",
  },
  openGraph: {
    title: "Service Serigraphie | خدمات الطباعة والتغليف الاحترافية",
    description: "اطلب الآن أكياسك المخصصة، ملصقاتك، وحلول التغليف لعلامتك التجارية. جودة مضمونة وتوصيل سريع لكل الولايات.",
    url: SITE_URL,
    siteName: "Service Serigraphie",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Service Serigraphie Logo",
      },
    ],
    locale: "ar_DZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Service Serigraphie | خدمات الطباعة في الجزائر",
    description: "أفضل حلول الطباعة والتغليف لعلامتك التجارية في الجزائر.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { createClient } from "@supabase/supabase-js";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  let primaryColor = "#00AEEF";
  let primaryColorRgb = "0 174 239";
  let secondaryColor = "#e6007e";
  let settingsMap: any = null;

  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase.from("settings").select("*");
      settingsMap = (data || []).reduce(
        (acc: Record<string, any>, s: { key: string; value: any }) => ({ ...acc, [s.key]: s.value }),
        {}
      );
      
      const branding = {
        storeName: settingsMap.branding?.storeName || "Service Serigraphie",
        logo: settingsMap.branding?.logo || "",
        footerLogo: settingsMap.branding?.footerLogo || settingsMap.branding?.logo || "",
        primaryColor: settingsMap.branding?.primaryColor || "#00AEEF",
        secondaryColor: settingsMap.branding?.secondaryColor || "#e6007e",
        whatsappNumber: settingsMap.branding?.whatsappNumber || "213",
        contactEmail: settingsMap.branding?.contactEmail || "",
        address: settingsMap.branding?.address || "الجزائر العاصمة",
        facebookUrl: settingsMap.branding?.facebookUrl || "#",
        instagramUrl: settingsMap.branding?.instagramUrl || "#",
      };

      const discounts = {
        cartDiscountEnabled: settingsMap.discounts?.newCustomerDiscountEnabled !== false,
        cartDiscountPercentage: settingsMap.discounts?.newCustomerDiscountPercent || 10,
        newCustomerDiscountType: settingsMap.discounts?.newCustomerDiscountType || 'percentage',
        cartMinItems: settingsMap.discounts?.newCustomerMinItems || 2,
        advancedRules: settingsMap.discounts?.advancedRules || [],
      };

      const navigation = settingsMap.navigation || [];
      const promobar = settingsMap.promobar || null;
      const rawMarketing = settingsMap.marketing || {};
      const marketing = { ...rawMarketing };
      delete marketing.fbAccessToken; // Do not leak CAPI token to client
      const slider = settingsMap.slider || [];
      const partners = settingsMap.partners || [];
      const popup = settingsMap.popup_offer || null;
      const largeOrderCta = settingsMap.large_order_cta || null;

      settingsMap = { branding, discounts, navigation, promobar, marketing, slider, partners, popup, largeOrderCta };
      
      primaryColor = branding.primaryColor;
      secondaryColor = branding.secondaryColor;
      
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : "0 174 239";
      };
      primaryColorRgb = hexToRgb(primaryColor);
    } catch (e) {
      console.error("SSR Settings Fetch Error", e);
    }
  }

  const cssVariables = {
    '--color-primary': primaryColor,
    '--color-secondary': secondaryColor,
    '--color-primary-rgb': primaryColorRgb,
  } as React.CSSProperties;

  // Maximum-speed popup: server-rendered markup + inline script.
  // Appears exactly at the configured delay, independent of hydration.
  const popupSettings = settingsMap?.popup;
  const popupPreloadUrl = getPopupImageUrl(popupSettings?.image);
  const popupSsrHtml = popupSettings?.enabled && popupPreloadUrl ?
    (() => {
      const title = escapeHtml(popupSettings.title || "عرض خاص");
      const description = popupSettings.description ? escapeHtml(popupSettings.description) : "";
      const buttonText = escapeHtml(popupSettings.buttonText || "اطلب الآن");
      const buttonLink = escapeHtml(popupSettings.buttonLink || "/products");
      return `<style>
#promo-popup-ssr{position:fixed;inset:0;z-index:100;display:none;align-items:center;justify-content:center;padding:1rem;background:rgba(0,0,0,.6);backdrop-filter:blur(4px)}
#promo-popup-ssr.on{display:flex}
#promo-popup-ssr .pp-card{animation:ppIn .25s ease-out}
@keyframes ppIn{from{opacity:0;transform:scale(.92) translateY(14px)}to{opacity:1;transform:scale(1) translateY(0)}}
</style>
<div id="promo-popup-ssr">
  <div class="pp-card relative w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden text-right" dir="rtl">
    <button onclick="window.__ppClose()" aria-label="إغلاق" style="position:absolute;top:14px;left:14px;z-index:20;width:36px;height:36px;border-radius:9999px;background:rgba(255,255,255,.85);color:#9ca3af;font-size:20px;line-height:1;box-shadow:0 1px 4px rgba(0,0,0,.15);cursor:pointer;border:0">×</button>
    <img src="${popupPreloadUrl}" alt="${title}" fetchpriority="high" decoding="async" style="width:100%;aspect-ratio:4/3;max-height:60vh;object-fit:contain;background:#f9fafb">
    <div style="padding:1rem 1.25rem 1.25rem;display:flex;flex-direction:column;gap:.6rem">
      <h2 style="font-weight:900;font-size:1.15rem;color:#111827;margin:0">${title}</h2>
      ${description ? `<p style="color:#6b7280;font-size:.85rem;font-weight:700;margin:0;line-height:1.6">${description}</p>` : ""}
      <a href="${buttonLink}" onclick="window.__ppClose()" style="display:block;width:100%;background:var(--color-primary);color:#fff;text-align:center;padding:.9rem;border-radius:1rem;font-weight:900;text-decoration:none;box-shadow:0 10px 20px -8px var(--color-primary)">${buttonText}</a>
      <button onclick="window.__ppClose()" style="background:none;border:0;color:#9ca3af;font-size:.75rem;font-weight:700;cursor:pointer;padding:.35rem">ربما لاحقًا</button>
    </div>
  </div>
</div>
<script>
(function(){
  var KEY="servseri_popup_shown_v2";
  var p=location.pathname;
  var ok=p==="/"||p==="/products"||p==="/offers"||p.indexOf("/products/")===0;
  if(!ok)return;
  window.__ppClose=function(){localStorage.setItem(KEY,Date.now().toString());var el=document.getElementById("promo-popup-ssr");if(el)el.classList.remove("on");};
  function open(){if(localStorage.getItem(KEY))return;var el=document.getElementById("promo-popup-ssr");if(!el)return;el.classList.add("on");localStorage.setItem(KEY,Date.now().toString());}
  if(localStorage.getItem(KEY))return;
  setTimeout(open,${(popupSettings.delay ?? 1500)});
})();
</script>`;
    })()
    : null;

  return (
    <html lang="ar" dir="rtl" style={cssVariables}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (location.protocol === 'http:' && location.hostname !== 'localhost' && !location.hostname.includes('127.0.0.1')) {
                location.replace(location.href.replace('http:', 'https:'));
              }
            `,
          }}
        />
        {popupPreloadUrl && popupSsrHtml && (
          <link rel="preload" as="image" href={popupPreloadUrl} fetchPriority="high" />
        )}
      </head>
      <body className={`${tajawal.variable} font-sans`}>
        {popupSsrHtml && <div dangerouslySetInnerHTML={{ __html: popupSsrHtml }} />}
        <SettingsProvider initialSettings={settingsMap}>
          <ScrollToTop />
          <MarketingPixels />
          <GlobalNavigation />
          {children}
          <Footer />
          <QuickAddModal />
          <OfferPopup />
        </SettingsProvider>
      </body>
    </html>
  );
}
