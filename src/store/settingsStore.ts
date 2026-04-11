import { create } from 'zustand';

interface Branding {
  storeName: string;
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  whatsappNumber: string;
}

interface Offers {
  cartDiscountEnabled: boolean;
  cartDiscountPercentage: number;
}

interface NavigationItem {
  label: string;
  href: string;
}

interface SettingsState {
  branding: Branding;
  offers: Offers;
  navigation: NavigationItem[];
  isLoaded: boolean;
  setSettings: (branding: Branding, offers: Offers, navigation: NavigationItem[]) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  branding: {
    storeName: "SacShop",
    logo: "",
    primaryColor: "#00AEEF",
    secondaryColor: "#f4f4f4",
    whatsappNumber: "213",
  },
  offers: {
    cartDiscountEnabled: true,
    cartDiscountPercentage: 10,
  },
  navigation: [],
  isLoaded: false,
  setSettings: (branding, offers, navigation) => set({ branding, offers, navigation, isLoaded: true }),
}));
