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

interface PopupOffer {
  enabled: boolean;
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  delay: number;
}

interface NavigationItem {
  label: string;
  href: string;
}

interface SettingsState {
  branding: Branding;
  discounts: Discounts;
  navigation: NavigationItem[];
  promobar: {
    enabled: boolean;
    bgColor: string;
    position: 'top' | 'bottom';
    buttons: any[];
  };
  marketing: any;
  slider: any[];
  partners: any[];
  popup: PopupOffer;
  isLoaded: boolean;
  setSettings: (branding: Branding, discounts: Discounts, navigation: NavigationItem[], promobar?: any, marketing?: any, slider?: any[], partners?: any[], popup?: PopupOffer) => void;
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
  promobar: { enabled: true, bgColor: "#00AEEF", position: 'top', buttons: [] },
  marketing: {},
  slider: [],
  partners: [],
  popup: { enabled: false, title: "", description: "", image: "", buttonText: "اطلب الآن", buttonLink: "/products", delay: 2000 },
  isLoaded: false,
  setSettings: (branding, discounts, navigation, promobar, marketing, slider, partners, popup) => 
    set({ 
      branding, 
      discounts, 
      navigation, 
      promobar: promobar || { enabled: true, bgColor: "#00AEEF", position: 'top', buttons: [] }, 
      marketing: marketing || {},
      slider: slider || [],
      partners: partners || [],
      popup: popup || { enabled: false, title: "", description: "", image: "", buttonText: "اطلب الآن", buttonLink: "/products", delay: 2000 },
      isLoaded: true 
    }),
}));
