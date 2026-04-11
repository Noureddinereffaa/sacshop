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

interface SettingsState {
  branding: Branding;
  offers: Offers;
  isLoaded: boolean;
  setSettings: (branding: Branding, offers: Offers) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  branding: {
    storeName: "SacShop",
    logo: "",
    primaryColor: "#10a37f",
    secondaryColor: "#f4f4f4",
    whatsappNumber: "213",
  },
  offers: {
    cartDiscountEnabled: true,
    cartDiscountPercentage: 10,
  },
  isLoaded: false,
  setSettings: (branding, offers) => set({ branding, offers, isLoaded: true }),
}));
