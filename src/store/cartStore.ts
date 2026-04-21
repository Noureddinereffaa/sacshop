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
  customer: any | null;
  appliedVipOffer: any | null;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (isOpen: boolean) => void;
  setCustomerStatus: (status: 'new' | 'vip' | 'guest', customer?: any) => void;
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
    discountType: 'percentage' | 'fixed';
    minItems: number;
    advancedRules?: {
      productId: string;
      discountType: 'percentage' | 'fixed';
      discountValue: number;
    }[];
  };
  setDiscountConfig: (config: { enabled: boolean; percentage: number; discountType: 'percentage' | 'fixed'; minItems: number; advancedRules?: any[] }) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      customerStatus: 'guest',
      customer: null,
      appliedVipOffer: null,
      discountConfig: { enabled: true, percentage: 10, discountType: 'percentage', minItems: 2, advancedRules: [] },
      
      setDiscountConfig: (config) => set({ discountConfig: config }),
      setCustomerStatus: (status, customer = null) => set({ customerStatus: status, customer }),
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
        let percentage = state.discountConfig.percentage;

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
          
          let totalCalculatedDiscount = 0;
          const advancedRules = state.discountConfig.advancedRules || [];
          
          state.items.forEach(item => {
            const rule = advancedRules.find(r => r.productId === item.productId);
            if (rule) {
              if (rule.discountType === 'fixed') {
                totalCalculatedDiscount += (rule.discountValue * item.quantity);
              } else if (rule.discountType === 'percentage') {
                totalCalculatedDiscount += Math.round(item.price * (rule.discountValue / 100)) * item.quantity;
              }
            } else {
               // Fallback to global percentage or fixed amount if no specific rule
               if (state.discountConfig.discountType === 'fixed') {
                 totalCalculatedDiscount += (state.discountConfig.percentage * item.quantity);
               } else {
                 totalCalculatedDiscount += Math.round(item.price * (state.discountConfig.percentage / 100)) * item.quantity;
               }
            }
          });
          
          discountAmount = totalCalculatedDiscount;
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
      name: 'servseri-cart',
    }
  )
);
