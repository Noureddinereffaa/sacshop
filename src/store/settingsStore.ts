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
  isLoaded: boolean;
  setSettings: (branding: Branding, discounts: Discounts, navigation: NavigationItem[]) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  branding: {
    storeName: "SacShop",
    logo: "",
    primaryColor: "#00AEEF",
    secondaryColor: "#f4f4f4",
    whatsappNumber: "213",
  },
  discounts: {
    cartDiscountEnabled: true,
    cartDiscountPercentage: 10,
    cartMinItems: 2
  },
  navigation: [],
  isLoaded: false,
  setSettings: (branding, discounts, navigation) => set({ branding, discounts, navigation, isLoaded: true }),
}));
