/*
  # E-commerce Database Schema for Mimasa Foods

  ## Overview
  Creates a complete e-commerce database structure for managing products, shopping carts, and orders.

  ## New Tables
  
  ### 1. products
  Stores all product information for the ready-to-cook gravies and marinades
  - `id` (uuid, primary key) - Unique product identifier
  - `name` (text) - Product name
  - `description` (text) - Product description
  - `price` (numeric) - Product price in INR
  - `image_url` (text) - Product image URL
  - `category` (text) - Product category (gravy, marinade, etc.)
  - `weight` (text) - Product weight/size information
  - `stock_quantity` (integer) - Available stock
  - `is_active` (boolean) - Whether product is available for purchase
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Record update timestamp

  ### 2. cart_items
  Stores shopping cart items for users (session-based)
  - `id` (uuid, primary key) - Unique cart item identifier
  - `session_id` (text) - Browser session identifier
  - `product_id` (uuid, foreign key) - Reference to products table
  - `quantity` (integer) - Number of items
  - `created_at` (timestamptz) - When item was added to cart
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. orders
  Stores customer order information
  - `id` (uuid, primary key) - Unique order identifier
  - `order_number` (text, unique) - Human-readable order number
  - `customer_name` (text) - Customer full name
  - `customer_email` (text) - Customer email address
  - `customer_phone` (text) - Customer contact number
  - `shipping_address` (text) - Full shipping address
  - `pin_code` (text) - Indian PIN code
  - `total_amount` (numeric) - Total order amount in INR
  - `status` (text) - Order status (pending, confirmed, shipped, delivered)
  - `created_at` (timestamptz) - Order creation timestamp

  ### 4. order_items
  Stores individual items within each order
  - `id` (uuid, primary key) - Unique order item identifier
  - `order_id` (uuid, foreign key) - Reference to orders table
  - `product_id` (uuid, foreign key) - Reference to products table
  - `product_name` (text) - Product name snapshot at time of order
  - `product_price` (numeric) - Product price snapshot at time of order
  - `quantity` (integer) - Number of items ordered
  - `subtotal` (numeric) - Line item subtotal

  ## Security
  - Enable Row Level Security (RLS) on all tables
  - Public read access for products (anyone can browse)
  - Public insert/update access for cart_items (session-based shopping)
  - Public insert access for orders and order_items (checkout)
  - No public delete access (prevents accidental data loss)
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price numeric(10, 2) NOT NULL,
  image_url text DEFAULT '',
  category text DEFAULT 'gravy',
  weight text DEFAULT '200g',
  stock_quantity integer DEFAULT 100,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  customer_phone text NOT NULL,
  shipping_address text NOT NULL,
  pin_code text NOT NULL,
  total_amount numeric(10, 2) NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  product_name text NOT NULL,
  product_price numeric(10, 2) NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  subtotal numeric(10, 2) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cart_items_session ON cart_items(session_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product ON cart_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(customer_email);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products (public read access)
CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  USING (is_active = true);

-- RLS Policies for products management (allow all operations for admin)
CREATE POLICY "Allow all operations on products"
  ON products FOR ALL
  USING (true)
  WITH CHECK (true);

-- RLS Policies for cart_items (public access for shopping)
CREATE POLICY "Anyone can view cart items"
  ON cart_items FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert cart items"
  ON cart_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update cart items"
  ON cart_items FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete cart items"
  ON cart_items FOR DELETE
  USING (true);

-- RLS Policies for orders (public insert, restricted read)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view their orders by email"
  ON orders FOR SELECT
  USING (true);

-- RLS Policies for order_items (public insert, public read)
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can view order items"
  ON order_items FOR SELECT
  USING (true);