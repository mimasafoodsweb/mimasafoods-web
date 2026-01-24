-- Drop existing RLS policies
DROP POLICY IF EXISTS "Admins can view all discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Admins can create discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Admins can update discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Admins can delete discount codes" ON discount_codes;
DROP POLICY IF EXISTS "Public can validate active discount codes" ON discount_codes;

-- Create simplified RLS policies for authenticated users
CREATE POLICY "Authenticated users can view discount codes" ON discount_codes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create discount codes" ON discount_codes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update discount codes" ON discount_codes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete discount codes" ON discount_codes
  FOR DELETE USING (auth.role() = 'authenticated');
