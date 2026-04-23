export interface CartItem {
  id: string; // unique configuration ID
  productId: string;
  name: string;
  price: number;
  image_url?: string;
  size?: string;
  sizeLabel?: string;
  color?: string;
  colorLabel?: string;
  quantity: number;
  num_colors?: number;
  is_double_sided?: boolean;
  custom_variant_selections?: Record<string, string>;
}

export interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  total_orders: number;
  total_spent: number;
  is_vip: boolean;
  address?: string;
}

export interface OrderItem {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  product_id?: string | null;
  product_price: number;
  total_price: number;
  status: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  admin_notes?: string | null;
  cart_items?: CartItem[];
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  compare_price: number | null;
  image_url: string;
  gallery?: string[];
  category: string;
  sizes: string[];
  size_label?: string;
  colors: { name: string; hex: string; extra_cost?: number }[];
  color_label?: string;
  packages?: { label: string; quantity: number; price: number }[];
  quantity_tiers?: any[];
  variant_images?: { size?: string; color?: string; image_url: string }[];
  printing_config?: {
    extra_color_price?: number;
    base_colors_included?: number;
    double_sided_price?: number;
  };
  /** Custom variant groups (e.g. Finition: Matte | Glossy) — no price impact */
  custom_variants?: CustomVariantGroup[];
  /** Per-size color availability map. If empty/null = all colors available for all sizes */
  size_color_availability?: Record<string, string[]>;
  stock: number;
  is_published: boolean;
  is_featured: boolean;
}

export interface CustomVariantGroup {
  /** Group label shown to customer, e.g. "نوع التشطيب" */
  label: string;
  /** Whether the customer MUST choose one option */
  required: boolean;
  /** The selectable options */
  options: string[];
}
