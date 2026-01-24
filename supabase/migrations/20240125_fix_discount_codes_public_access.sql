-- Drop existing RLS policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can view discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Authenticated users can create discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Authenticated users can update discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Authenticated users can delete discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Public can read active discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Admins can manage discount codes" ON discount_codes;

-- Create public read policy for discount validation (anyone can read active codes)
CREATE POLICY "Public can read active discount codes" ON discount_codes
  FOR SELECT USING (
    is_active = true AND 
    (expires_at IS NULL OR expires_at > NOW())
  );

-- Create admin policies for management
CREATE POLICY "Admins can manage discount codes" ON discount_codes
  FOR ALL USING (
    auth.role() = 'authenticated' 
  );

-- Ensure RLS is enabled
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
