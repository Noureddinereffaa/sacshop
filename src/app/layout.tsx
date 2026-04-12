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
  title: "Service Serigraphie | أفضل خدمات الطباعة والتغليف في الجزائر",
  description: "حلول احترافية للطباعة والتغليف. أكياس، ملصقات، ومطبوعات بجودة عالية وتوصيل سريع لجميع الولايات. اطلب الآن واستفد من عروض VIP.",
};

import SettingsProvider from "@/components/SettingsProvider";
import dynamic from "next/dynamic";
import WhatsAppButton from "@/components/WhatsAppButton";

const QuickAddModal = dynamic(() => import("@/components/QuickAddModal"));
import Header from "@/components/Header";
import PromoStrip from "@/components/PromoStrip";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} font-sans`}>
        <SettingsProvider>
          <MarketingPixels />
          <div className="sticky top-0 z-[100] w-full">
            <PromoStrip />
            <Header />
          </div>
          {children}
          <Footer />
          <QuickAddModal />
          <WhatsAppButton />
        </SettingsProvider>
      </body>
    </html>
  );
}
