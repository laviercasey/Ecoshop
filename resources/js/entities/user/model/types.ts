export interface Address {
  id: number;
  user_id: number;
  type: string | null;
  city: string;
  street: string;
  building: string | null;
  apartment: string | null;
  postal_code: string | null;
  region: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  addresses?: Address[];
  orders?: UserOrder[];
}

interface UserOrder {
  id: number;
  number: string;
  status: string;
  total: number;
  created_at: string;
}
