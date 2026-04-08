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
  title: "SacShop.dz | أفضل حقائب وأكياس في الجزائر",
  description: "تسوق أجود أنواع الحقائب والأكياس بتوصيل سريع لجميع ولايات الجزائر. الدفع عند الاستلام.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} font-sans`}>
        <MarketingPixels />
        {children}
      </body>
    </html>
  );
}
