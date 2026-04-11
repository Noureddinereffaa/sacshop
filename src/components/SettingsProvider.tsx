"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSettingsStore } from "@/store/settingsStore";
import { useCartStore } from "@/store/cartStore";

export default function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { setSettings } = useSettingsStore();
  const { setDiscountConfig } = useCartStore();

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
          storeName: settingsMap.branding?.storeName || "SacShop",
          logo: settingsMap.branding?.logo || "",
          primaryColor: settingsMap.branding?.primaryColor || "#10a37f",
          secondaryColor: settingsMap.branding?.secondaryColor || "#f4f4f4",
          whatsappNumber: settingsMap.branding?.whatsappNumber || "213",
        };

        const discounts = {
          cartDiscountEnabled: settingsMap.discounts?.newCustomerDiscountEnabled !== false,
          cartDiscountPercentage: settingsMap.discounts?.newCustomerDiscountPercent || 10,
          cartMinItems: settingsMap.discounts?.newCustomerMinItems || 2,
        };
 
        const navigation = settingsMap.navigation || [];
 
        // 1. Update global store
        setSettings(branding, discounts, navigation);
 
        // 2. Sync Cart Store logic
        setDiscountConfig({
          enabled: discounts.cartDiscountEnabled, 
          percentage: discounts.cartDiscountPercentage,
          minItems: discounts.cartMinItems
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

      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    }

    initSettings();
  }, [setSettings, setDiscountConfig]);

  return <>{children}</>;
}
