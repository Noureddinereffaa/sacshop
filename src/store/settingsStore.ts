import { create } from 'zustand';

interface Branding {
  storeName: string;
  logo: string;
  footerLogo: string;
  primaryColor: string;
  secondaryColor: string;
  whatsappNumber: string;
  contactEmail?: string;
  address?: string;
  facebookUrl?: string;
  instagramUrl?: string;
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
    footerLogo: "/brand/logo-horizontal-1.png",
    primaryColor: "#00AEEF",
    secondaryColor: "#e6007e",
    whatsappNumber: "213",
    contactEmail: "",
    address: "الجزائر العاصمة",
    facebookUrl: "#",
    instagramUrl: "#",
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
    set({ branding, discounts, navigation, promobar: promobar || { enabled: true, bgColor: "#00AEEF", buttons: [] }, marketing: marketing || {}, isLoaded: true }),
}));
