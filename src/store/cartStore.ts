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
  num_colors?: number;
  is_double_sided?: boolean;
  custom_variant_selections?: Record<string, string>;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  customerStatus: 'new' | 'vip' | 'guest';
  appliedVipOffer: any | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setCustomerStatus: (status: 'new' | 'vip' | 'guest') => void;
  setAppliedVipOffer: (offer: any | null) => void;
  getCartTotal: () => number;
  getDiscountInfo: () => {
    isEligible: boolean;
    discountType: 'welcome' | 'vip' | 'none';
    subtotal: number;
    discountAmount: number;
    finalTotal: number;
    percentage: number;
    label: string;
    minItems: number;
  };
  discountConfig: {
    enabled: boolean;
    percentage: number;
    minItems: number;
  };
  setDiscountConfig: (config: { enabled: boolean; percentage: number; minItems: number }) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      customerStatus: 'guest',
      appliedVipOffer: null,
      discountConfig: { enabled: true, percentage: 10, minItems: 2 },
      
      setDiscountConfig: (config) => set({ discountConfig: config }),
      setCustomerStatus: (status) => set({ customerStatus: status }),
      setAppliedVipOffer: (offer) => set({ appliedVipOffer: offer }),
      
      addItem: (item) => set((state) => {
        // Find if this exact configuration exists
        const existing = state.items.find(
          (i) => 
            i.productId === item.productId && 
            i.size === item.size && 
            i.color === item.color &&
            i.num_colors === item.num_colors &&
            i.is_double_sided === item.is_double_sided &&
            JSON.stringify(i.custom_variant_selections) === JSON.stringify(item.custom_variant_selections)
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
        // Count unique products, not total pieces
        const productCount = new Set(state.items.map(i => i.productId)).size;
        const subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        let isEligible = false;
        let discountAmount = 0;
        let discountType: 'welcome' | 'vip' | 'none' = 'none';
        let label = "";
        let percentage = 0;

        // 1. VIP Offer Take Precedence if set (Returning Customers)
        if (state.customerStatus === 'vip' && state.appliedVipOffer) {
          isEligible = true;
          discountType = 'vip';
          label = `خصم VIP: ${state.appliedVipOffer.title}`;
          if (state.appliedVipOffer.discount_type === 'percentage') {
            percentage = state.appliedVipOffer.discount_value;
            discountAmount = Math.round(subtotal * (percentage / 100));
          } else {
            discountAmount = state.appliedVipOffer.discount_value;
            percentage = Math.round((discountAmount / subtotal) * 100);
          }
        } 
        // 2. Welcome Discount (New or Guest Customers)
        else if (
          (state.customerStatus === 'new' || state.customerStatus === 'guest') && 
          state.discountConfig.enabled && 
          productCount >= state.discountConfig.minItems
        ) {
          isEligible = true;
          discountType = 'welcome';
          percentage = state.discountConfig.percentage;
          label = "خصم ترحيبي للزبائن الجدد";
          discountAmount = Math.round(subtotal * (percentage / 100));
        }

        const finalTotal = subtotal - discountAmount;
        
        return {
          isEligible,
          discountType,
          subtotal,
          discountAmount,
          finalTotal,
          percentage,
          label,
          minItems: state.discountConfig.minItems
        };
      }
    }),
    {
      name: 'sacshop-cart',
    }
  )
);
