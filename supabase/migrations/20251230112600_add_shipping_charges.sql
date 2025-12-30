-- Add shipping charge column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS shipping_charge DECIMAL(10,2) DEFAULT 0.00;

-- Update existing orders to calculate subtotal and shipping
UPDATE orders 
SET 
  subtotal = total_amount - COALESCE(shipping_charge, 0),
  shipping_charge = CASE 
    WHEN (total_amount - COALESCE(shipping_charge, 0)) < 500 THEN 70 
    ELSE 0 
  END
WHERE shipping_charge IS NULL OR subtotal IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_shipping_charge ON orders(shipping_charge);
CREATE INDEX IF NOT EXISTS idx_orders_subtotal ON orders(subtotal);
