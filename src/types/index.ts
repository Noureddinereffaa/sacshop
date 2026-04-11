export interface CartItem {
  id: string; // product_id
  name: string;
  price: number;
  image_url?: string;
  size?: string;
  color?: string;
  quantity: number;
}

export interface CustomerData {
  id: string;
  name: string;
  phone: string;
  email?: string;
  total_orders: number;
  total_spent: number;
  is_vip: boolean;
  wilaya_id?: number | null;
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
  delivery_type: string;
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
  colors: { name: string; hex: string; extra_cost?: number }[];
  packages?: { label: string; quantity: number; price: number }[];
  quantity_tiers?: any[];
  variant_images?: { size?: string; color?: string; image_url: string }[];
  printing_config?: {
    extra_color_price?: number;
    base_colors_included?: number;
    double_sided_price?: number;
  };
  stock: number;
  is_published: boolean;
  is_featured: boolean;
}
