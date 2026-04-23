import type { Metadata, Viewport } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import MarketingPixels from "@/components/MarketingPixels";
import SettingsProvider from "@/components/SettingsProvider";
import dynamic from "next/dynamic";
import WhatsAppButton from "@/components/WhatsAppButton";
import GlobalNavigation from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";
import OfferPopup from "@/components/OfferPopup";
import ScrollToTop from "@/components/ScrollToTop";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

const QuickAddModal = dynamic(() => import("@/components/QuickAddModal"));

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FF3366",
};

export const revalidate = 60; // Revalidate settings every 60 seconds


export const metadata: Metadata = {
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
    url: "https://serviceserigraphie.com",
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
      const marketing = settingsMap.marketing || null;
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
      </head>
      <body className={`${tajawal.variable} font-sans`}>
        <SettingsProvider initialSettings={settingsMap}>
          <ScrollToTop />
          <MarketingPixels />
          <GlobalNavigation />
          {children}
          <Footer />
          <QuickAddModal />
          <OfferPopup />
          <WhatsAppButton />
        </SettingsProvider>
      </body>
    </html>
  );
}
