export interface CartProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_price: number | null;
  image: string | null;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}
