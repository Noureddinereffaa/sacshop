import { create } from 'zustand';

interface Branding {
  storeName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  whatsappNumber: string;
}

interface Discounts {
  cartDiscountEnabled: boolean;
  cartDiscountPercentage: number;
  cartMinItems: number;
}

interface NavigationItem {
  label: string;
  href: string;
}

interface SettingsState {
  branding: Branding;
  discounts: Discounts;
  navigation: NavigationItem[];
  promobar: any;
  marketing: any;
  isLoaded: boolean;
  setSettings: (branding: Branding, discounts: Discounts, navigation: NavigationItem[], promobar?: any, marketing?: any) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  branding: {
    storeName: "Service Serigraphie",
    logo: "/brand/logo-horizontal-1.png",
    primaryColor: "#00AEEF",
    secondaryColor: "#e6007e",
    whatsappNumber: "213",
  },
  discounts: {
    cartDiscountEnabled: true,
    cartDiscountPercentage: 10,
    cartMinItems: 2
  },
  navigation: [],
  promobar: { enabled: true, bgColor: "#00AEEF", buttons: [] },
  marketing: {},
  isLoaded: false,
  setSettings: (branding, discounts, navigation, promobar, marketing) => 
    set({ branding, discounts, navigation, promobar: promobar || { enabled: true, bgColor: "#00AEEF", buttons: [{ label: "إذا كنت صاحب صيدلية اضغط هنا", link: "/products?category=pharmacy", color: "green", position: "right" }, { label: "العروض والتخفيضات", link: "/offers", color: "white", position: "left" }] }, marketing: marketing || {}, isLoaded: true }),
}));
