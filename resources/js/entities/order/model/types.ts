export type OrderStatus = 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type PaymentMethod = 'card' | 'cash' | 'sbp';

export type ShippingMethod = 'cdek' | 'pickup' | 'russian_post';

export interface ShippingAddress {
  city: string;
  street: string;
  building: string | null;
  apartment: string | null;
  postal_code: string | null;
  region: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number | null;
  product_name: string;
  product_sku: string;
  quantity: number;
  price: number;
  branding_option: string | null;
}

export interface Order {
  id: number;
  number: string;
  user_id: number | null;
  status: OrderStatus;
  subtotal: number;
  shipping_cost: number;
  total: number;
  payment_method: PaymentMethod | null;
  shipping_method: ShippingMethod | null;
  tracking_number: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  customer_note: string | null;
  shipping_address: ShippingAddress | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  user?: OrderUser | null;
  items?: OrderItem[];
}

interface OrderUser {
  id: number;
  name: string;
  email: string;
}
