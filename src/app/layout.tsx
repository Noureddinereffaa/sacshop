import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import MarketingPixels from "@/components/MarketingPixels";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

export const metadata: Metadata = {
  title: "Service Serigraphie | طباعة أكياس، ملصقات، وتغليف في الجزائر",
  description: "Service Serigraphie - شريكك الأول في الجزائر للطباعة الاحترافية. نحن متخصصون في طباعة الأكياس الورقية والقماشية، الملصقات (Stickers)، وحلول التغليف المخصصة. جودة عالية وتوصيل لـ 58 ولاية.",
  keywords: ["طباعة", "أكياس ورقية", "ملصقات", "تغليف", "سيريغرافي", "الجزائر", "أكياس قماشية", "Service Serigraphie", "printing algeria"],
  authors: [{ name: "Service Serigraphie" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#FF3366",
  icons: {
    icon: "/favicon.png?v=2",
    apple: "/favicon.png?v=2",
  },
  openGraph: {
    title: "Service Serigraphie | خدمات الطباعة والتغليف الاحترافية",
    description: "اطلب الآن أكياسك المخصصة، ملصقاتك، وحلول التغليف لعلامتك التجارية. جودة مضمونة وتوصيل سريع لكل الولايات.",
    url: "https://www.facebook.com/search/top?q=service%20s%C3%A8rigraphie",
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

import SettingsProvider from "@/components/SettingsProvider";
import dynamic from "next/dynamic";
import WhatsAppButton from "@/components/WhatsAppButton";

const QuickAddModal = dynamic(() => import("@/components/QuickAddModal"));
import GlobalNavigation from "@/components/GlobalNavigation";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
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
        <SettingsProvider>
          <MarketingPixels />
          <GlobalNavigation />
          {children}
          <Footer />
          <QuickAddModal />
          <WhatsAppButton />
        </SettingsProvider>
      </body>
    </html>
  );
}
