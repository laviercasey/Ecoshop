export interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  link: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
