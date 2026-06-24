"use client";

import { useEffect, useRef } from "react";
import { useSettingsStore } from "@/store/settingsStore";
import { useCartStore } from "@/store/cartStore";

export default function SettingsProvider({ children, initialSettings }: { children: React.ReactNode; initialSettings?: any }) {
  const { setSettings } = useSettingsStore();
  const { setDiscountConfig, setCustomerStatus, setAppliedVipOffer } = useCartStore();
  const initialized = useRef(false);

  // Synchronous initialization for SSR Hydration
  if (!initialized.current) {
    if (initialSettings) {
      const s = initialSettings;
      setSettings(
        s.branding,
        s.discounts,
        s.navigation,
        s.promobar,
        s.marketing,
        s.slider,
        s.partners,
        s.popup,
        s.largeOrderCta
      );
      setDiscountConfig({
        enabled: s.discounts.cartDiscountEnabled, 
        percentage: s.discounts.cartDiscountPercentage,
        discountType: s.discounts.newCustomerDiscountType || 'percentage',
        minItems: s.discounts.cartMinItems,
        advancedRules: s.discounts.advancedRules
      });
    } else {
      // If no initial settings (e.g. SSR fetch failed), at least unblock the UI
      useSettingsStore.setState({ isLoaded: true });
    }
    initialized.current = true;
  }

  useEffect(() => {
    async function checkVIP() {
      // Initial identity check if phone exists in sessionStorage
      const phone = sessionStorage.getItem("servseri_phone");
      if (phone) {
        try {
          const res = await fetch("/api/customer", {
            method: "POST",
            body: JSON.stringify({ phone }),
          });
          const data = await res.json();
          if (data.customer) {
            const status = (data.customer.total_orders || 0) === 0 ? 'new' : 'vip';
            setCustomerStatus(status, data.customer);
            if (status === 'vip' && data.vipOffers?.length > 0) {
              setAppliedVipOffer(data.vipOffers[0]);
            }
          }
        } catch (e) { console.error("Identity check failed:", e); }
      }
    }

    checkVIP();
  }, [setCustomerStatus, setAppliedVipOffer]);

  return <>{children}</>;
}
