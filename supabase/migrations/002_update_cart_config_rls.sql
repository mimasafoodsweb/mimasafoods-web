-- Update RLS policies to allow authenticated admin users to modify cart_config

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Only service role can modify cart config" ON cart_config;

-- Create new policy for insert/update (authenticated users can modify)
CREATE POLICY "Authenticated users can modify cart config" ON cart_config
  FOR ALL USING (auth.role() = 'authenticated');

-- Optional: You can also restrict to specific admin users if needed
-- CREATE POLICY "Admin users can modify cart config" ON cart_config
--   FOR ALL USING (
--     auth.role() = 'authenticated' 
--     AND auth.email() IN ('admin@example.com', 'your-admin-email@example.com')
--   );
