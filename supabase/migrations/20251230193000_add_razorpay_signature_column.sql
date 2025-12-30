-- Add razorpay_signature column to orders table if it doesn't exist
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_signature ON orders(razorpay_signature);

-- Add comment for documentation
COMMENT ON COLUMN orders.razorpay_signature IS 'Razorpay payment signature for verification';
