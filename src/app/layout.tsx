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

const QuickAddModal = dynamic(() => import("@/components/QuickAddModal"));

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
          {children}
          <QuickAddModal />
        </SettingsProvider>
      </body>
    </html>
  );
}
