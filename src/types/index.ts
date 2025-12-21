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
  total_amount: number;
  status: string;
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
