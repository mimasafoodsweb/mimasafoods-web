-- Create discount_codes table
CREATE TABLE discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_amount DECIMAL(10,2) DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create indexes for performance
CREATE INDEX idx_discount_codes_code ON discount_codes(code);
CREATE INDEX idx_discount_codes_active ON discount_codes(is_active, expires_at);
CREATE INDEX idx_discount_codes_created_by ON discount_codes(created_by);

-- Enable Row Level Security
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow authenticated users to read discount codes
CREATE POLICY "Authenticated users can view discount codes" ON discount_codes
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert discount codes
CREATE POLICY "Authenticated users can create discount codes" ON discount_codes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update discount codes
CREATE POLICY "Authenticated users can update discount codes" ON discount_codes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete discount codes
CREATE POLICY "Authenticated users can delete discount codes" ON discount_codes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Allow public read access for active, non-expired codes (for validation)
CREATE POLICY "Public can validate active discount codes" ON discount_codes
  FOR SELECT USING (
    is_active = true 
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Create function to validate discount codes
CREATE OR REPLACE FUNCTION validate_discount_code(
  code_input TEXT,
  order_amount DECIMAL
) RETURNS TABLE(
  valid BOOLEAN,
  discount_amount DECIMAL,
  message TEXT,
  discount_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.is_active 
    AND (dc.expires_at IS NULL OR dc.expires_at > NOW())
    AND (dc.usage_limit IS NULL OR dc.usage_count < dc.usage_limit)
    AND order_amount >= COALESCE(dc.min_order_amount, 0) AS valid,
    CASE 
      WHEN dc.discount_type = 'percentage' THEN 
        LEAST(order_amount * dc.discount_value / 100, COALESCE(dc.max_discount_amount, order_amount))
      ELSE dc.discount_value
    END AS discount_amount,
    CASE 
      WHEN NOT dc.is_active THEN 'Code is inactive'
      WHEN dc.expires_at IS NOT NULL AND dc.expires_at <= NOW() THEN 'Code has expired'
      WHEN dc.usage_limit IS NOT NULL AND dc.usage_count >= dc.usage_limit THEN 'Usage limit exceeded'
      WHEN order_amount < COALESCE(dc.min_order_amount, 0) THEN 'Minimum order amount not met'
      ELSE 'Valid'
    END AS message,
    dc.id AS discount_id
  FROM discount_codes dc
  WHERE dc.code = code_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment discount usage
CREATE OR REPLACE FUNCTION increment_discount_usage(discount_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE discount_codes 
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = discount_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_discount_codes_updated_at
    BEFORE UPDATE ON discount_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE orders ADD COLUMN discount_code_id UUID REFERENCES discount_codes(id);
ALTER TABLE orders ADD COLUMN discount_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN original_amount DECIMAL(10,2);
