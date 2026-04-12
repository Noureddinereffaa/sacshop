import { create } from 'zustand';
import { Product } from '@/types';

interface QuickAddStore {
  isOpen: boolean;
  product: Product | null;
  open: (product: Product) => void;
  close: () => void;
}

export const useQuickAddStore = create<QuickAddStore>((set) => ({
  isOpen: false,
  product: null,
  open: (product) => set({ isOpen: true, product }),
  close: () => set({ isOpen: false, product: null }),
}));
