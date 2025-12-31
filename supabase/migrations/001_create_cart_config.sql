-- Create cart_config table for shopping cart configuration parameters
CREATE TABLE IF NOT EXISTS cart_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE cart_config ENABLE ROW LEVEL SECURITY;

-- Create policy for read access (all users can read config)
CREATE POLICY "Anyone can read cart config" ON cart_config
  FOR SELECT USING (true);

-- Create policy for insert/update (only authenticated service_role can modify)
CREATE POLICY "Only service role can modify cart config" ON cart_config
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Insert initial shipping configuration
INSERT INTO cart_config (name, value) 
VALUES 
  ('shipping', '5'),
  ('free_shipping', '500')
ON CONFLICT (name) DO UPDATE SET 
  value = EXCLUDED.value,
  updated_at = NOW();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cart_config_name ON cart_config(name);

-- Create function to get config value
CREATE OR REPLACE FUNCTION get_cart_config(config_name TEXT)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT value FROM cart_config WHERE name = config_name LIMIT 1;
$$;
