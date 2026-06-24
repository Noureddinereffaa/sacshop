"use client";

import { useSettingsStore } from "@/store/settingsStore";
import Header from "./Header";
import PromoStrip from "./PromoStrip";

import { usePathname } from "next/navigation";

export default function GlobalNavigation() {
  const pathname = usePathname();
  const { promobar } = useSettingsStore();

  if (pathname?.startsWith("/admin")) return null;

  const position = promobar?.position || 'top';

  return (
    <div className="sticky top-0 z-[100] w-full shadow-sm">
      {position === 'top' ? (
        <>
          <PromoStrip />
          <Header />
        </>
      ) : (
        <>
          <Header />
          <PromoStrip />
        </>
      )}
    </div>
  );
}
