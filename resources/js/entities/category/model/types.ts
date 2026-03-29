export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: Category | null;
  children?: Category[];
  products?: CategoryProduct[];
}

interface CategoryProduct {
  id: number;
  name: string;
  slug: string;
  price: number;
}
