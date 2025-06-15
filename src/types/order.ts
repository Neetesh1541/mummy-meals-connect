
export interface Order {
  id: string;
  status: string;
  created_at: string;
  quantity: number;
  total_amount?: number;
  payment_method?: string;
  shipping_details?: {
    name: string;
    address: any;
  };
  estimated_delivery_at?: string | null;
  delivery_partner_id?: string | null;
  delivery_fee?: number;

  menu: {
    title: string;
    price?: number;
  };

  // Relations to users table
  customer?: {
    full_name: string;
    phone?: string;
    address?: any;
  };
  mom?: {
    full_name: string;
    phone?: string;
    address?: any;
  };
  delivery_partner?: {
    full_name: string;
    phone?: string;
  } | null;
}
