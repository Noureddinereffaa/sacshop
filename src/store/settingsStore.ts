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
  newCustomerDiscountType: 'percentage' | 'fixed';
  cartMinItems: number;
  advancedRules?: {
    productId: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
  }[];
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

interface LargeOrderCta {
  enabled: boolean;
  title: string;
  description: string;
  button1Text: string;
  button1Link: string;
  button2Text: string;
  button2Link: string;
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
  largeOrderCta: LargeOrderCta;
  isLoaded: boolean;
  setSettings: (branding: Branding, discounts: Discounts, navigation: NavigationItem[], promobar?: any, marketing?: any, slider?: any[], partners?: any[], popup?: PopupOffer, largeOrderCta?: LargeOrderCta) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  branding: {
    storeName: "Service Serigraphie",
    logo: "",
    footerLogo: "",
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
    newCustomerDiscountType: 'percentage',
    cartMinItems: 2,
    advancedRules: []
  },
  navigation: [],
  promobar: { enabled: true, bgColor: "#00AEEF", position: 'top', buttons: [] },
  marketing: {},
  slider: [],
  partners: [],
  popup: { enabled: false, title: "", description: "", image: "", buttonText: "اطلب الآن", buttonLink: "/products", delay: 2000 },
  largeOrderCta: {
    enabled: true,
    title: "هل لديك طلبية كبيرة جداً؟",
    description: "إذا كنت تمثل علامة تجارية أو تبحث عن أسعار المصنع للكميات التي تتجاوز 10,000 قطعة، تواصل معنا مباشرة للحصول على عرض سعر مخصص.",
    button1Text: "تحدث مع مدير المبيعات",
    button1Link: "https://wa.me/213",
    button2Text: "مشاهدة كافة الأسعار",
    button2Link: "/products"
  },
  isLoaded: false,
  setSettings: (branding, discounts, navigation, promobar, marketing, slider, partners, popup, largeOrderCta) => 
    set({ 
      branding, 
      discounts, 
      navigation, 
      promobar: promobar || { enabled: true, bgColor: "#00AEEF", position: 'top', buttons: [] }, 
      marketing: marketing || {},
      slider: slider || [],
      partners: partners || [],
      popup: popup || { enabled: false, title: "", description: "", image: "", buttonText: "اطلب الآن", buttonLink: "/products", delay: 2000 },
      largeOrderCta: largeOrderCta || {
        enabled: true,
        title: "هل لديك طلبية كبيرة جداً؟",
        description: "إذا كنت تمثل علامة تجارية أو تبحث عن أسعار المصنع للكميات التي تتجاوز 10,000 قطعة، تواصل معنا مباشرة للحصول على عرض سعر مخصص.",
        button1Text: "تحدث مع مدير المبيعات",
        button1Link: "https://wa.me/213",
        button2Text: "مشاهدة كافة الأسعار",
        button2Link: "/products"
      },
      isLoaded: true 
    }),
}));
