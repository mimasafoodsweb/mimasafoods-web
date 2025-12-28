-- Add Razorpay payment fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_order_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_payment_id text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS razorpay_signature text;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'razorpay';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_amount numeric(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_date timestamptz;

-- Add indexes for payment-related queries
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Add constraint for payment status
BEGIN;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_payment_status;
ALTER TABLE orders ADD CONSTRAINT check_payment_status 
CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded'));



-- Update existing orders to have default payment status
UPDATE orders SET payment_status = 'pending' WHERE payment_status IS NULL;
COMMIT;
