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
