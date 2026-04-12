"use client";

import { useSettingsStore } from "@/store/settingsStore";
import Header from "./Header";
import PromoStrip from "./PromoStrip";

export default function GlobalNavigation() {
  const { promobar } = useSettingsStore();
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
