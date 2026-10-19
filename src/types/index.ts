export interface Product {
  id: string;
  name: string;
  description: string;
  long_description?: string;
  price: number;
  image_url: string;
  category: string;
  weight: string;
  stock_quantity: number;
  is_active: boolean;
  diet?: 'veg' | 'nonveg' | 'both';
  name_devanagari?: string | null;
  preparation_method?: string[] | null;
}

export interface CartItem {
  id: string;
  session_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface Order {
  id?: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  pin_code: string;
  subtotal?: number;
  shipping_charge?: number;
  discount_amount?: number;
  total_amount: number;
  status: string;
  payment_status?: string;
  created_at?: string;
}

export interface OrderItem {
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface Review {
  id: string;
  product_id: string | null;
  name: string;
  rating: number;
  text: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  product?: { name: string } | null;
}

export interface Enquiry {
  id: string;
  business_line: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  city: string;
  message: string | null;
  created_at: string;
}
