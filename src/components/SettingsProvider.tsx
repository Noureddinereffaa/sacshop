"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSettingsStore } from "@/store/settingsStore";
import { useCartStore } from "@/store/cartStore";

export default function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { setSettings } = useSettingsStore();
  const { setDiscountConfig, setCustomerStatus, setAppliedVipOffer } = useCartStore();

  useEffect(() => {
    if (!supabase) return;

    async function initSettings() {
      try {
        const { data } = await supabase!.from("settings").select("*");
        const settingsMap = (data || []).reduce(
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
          cartMinItems: settingsMap.discounts?.newCustomerMinItems || 2,
          advancedRules: settingsMap.discounts?.advancedRules || [],
        };
 
        const navigation = settingsMap.navigation || [];
        const promobar = settingsMap.promobar || null;
        const marketing = settingsMap.marketing || null;
        const slider = settingsMap.slider || [];
        const partners = settingsMap.partners || [];
        const popup = settingsMap.popup_offer || null;
 
        // 1. Update global store
        setSettings(branding, discounts, navigation, promobar, marketing, slider, partners, popup);
 
        // 2. Sync Cart Store logic
        setDiscountConfig({
          enabled: discounts.cartDiscountEnabled, 
          percentage: discounts.cartDiscountPercentage,
          discountType: discounts.newCustomerDiscountType || 'percentage',
          minItems: discounts.cartMinItems,
          advancedRules: discounts.advancedRules
        });

        // 3. Inject CSS Variables for Dynamic Branding
        const root = document.documentElement;
        root.style.setProperty("--color-primary", branding.primaryColor);
        root.style.setProperty("--color-secondary", branding.secondaryColor);
        
        // Add a primary-rgb for translucency support in tailwind
        const hexToRgb = (hex: string) => {
          const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
          return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : "16 163 127";
        };
        root.style.setProperty("--color-primary-rgb", hexToRgb(branding.primaryColor));

        // 4. Initial identity check if phone exists
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

      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }

    initSettings();
  }, [setSettings, setDiscountConfig]);

  return <>{children}</>;
}
