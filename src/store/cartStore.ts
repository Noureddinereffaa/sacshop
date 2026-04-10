import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique identifier for the exact configuration
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  size?: string;
  color?: string;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  getCartTotal: () => number;
  getDiscountInfo: () => {
    isEligible: boolean;
    subtotal: number;
    discountAmount: number;
    finalTotal: number;
    percentage: number;
  };
  discountConfig: {
    enabled: boolean;
    percentage: number;
  };
  setDiscountConfig: (enabled: boolean, percentage: number) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      discountConfig: { enabled: true, percentage: 10 },
      
      setDiscountConfig: (enabled, percentage) => set({ discountConfig: { enabled, percentage } }),
      
      addItem: (item) => set((state) => {
        // Find if this exact configuration exists
        const existing = state.items.find(
          (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
        );

        if (existing) {
          return {
            items: state.items.map((i) =>
              i.id === existing.id ? { ...i, quantity: i.quantity + item.quantity } : i
            )
          };
        }
        
        return { items: [...state.items, item] };
      }),
      
      removeItem: (id) => set((state) => ({ 
        items: state.items.filter((item) => item.id !== id) 
      })),
      
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
        ),
      })),
      
      clearCart: () => set({ items: [] }),
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      setIsOpen: (isOpen) => set({ isOpen }),
      
      getCartTotal: () => {
        const state = get();
        return state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },
      
      getDiscountInfo: () => {
        const state = get();
        const totalItems = state.items.reduce((acc, item) => acc + item.quantity, 0);
        const subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        const isEligible = state.discountConfig.enabled && totalItems >= 2;
        const discountAmount = isEligible ? Math.round(subtotal * (state.discountConfig.percentage / 100)) : 0;
        const finalTotal = subtotal - discountAmount;
        
        return {
          isEligible,
          subtotal,
          discountAmount,
          finalTotal,
          percentage: state.discountConfig.percentage
        };
      }
    }),
    {
      name: 'sacshop-cart',
    }
  )
);
