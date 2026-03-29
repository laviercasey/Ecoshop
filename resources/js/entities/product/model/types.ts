export interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
  sort_order: number;
}

export interface ProductAttribute {
  id: number;
  product_id: number;
  name: string;
  value: string;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  compare_price: number | null;
  old_price: number | null;
  has_discount: boolean;
  discount_percent: number | null;
  stock: number;
  min_order_qty: number;
  unit: string | null;
  dimensions: string | null;
  weight: number | null;
  is_published: boolean;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  image_url: string | null;
  category_names: string[];
  category_slugs: string[];
  categories?: Category[];
  images?: ProductImage[];
  attributes?: ProductAttribute[];
}

interface Category {
  id: number;
  name: string;
  slug: string;
}
