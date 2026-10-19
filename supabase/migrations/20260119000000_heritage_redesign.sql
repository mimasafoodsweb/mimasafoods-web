-- Heritage redesign: additive changes only (no changes to existing columns/tables).

-- 1. Product display fields
ALTER TABLE products ADD COLUMN IF NOT EXISTS diet text DEFAULT 'veg';
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_diet_check;
ALTER TABLE products ADD CONSTRAINT products_diet_check CHECK (diet IN ('veg', 'nonveg', 'both'));
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_devanagari text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS preparation_steps text[];

-- 2. Customer reviews (public insert as 'pending'; public read only when 'approved')
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text text NOT NULL CHECK (char_length(text) BETWEEN 1 AND 1000),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reviews_status_created ON reviews(status, created_at DESC);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit pending reviews" ON reviews;
CREATE POLICY "Public can submit pending reviews" ON reviews
  FOR INSERT TO anon, authenticated WITH CHECK (status = 'pending');

DROP POLICY IF EXISTS "Public can read approved reviews" ON reviews;
CREATE POLICY "Public can read approved reviews" ON reviews
  FOR SELECT TO anon, authenticated USING (status = 'approved');

DROP POLICY IF EXISTS "Admins can manage reviews" ON reviews;
CREATE POLICY "Admins can manage reviews" ON reviews
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT INSERT, SELECT ON reviews TO anon;
GRANT ALL ON reviews TO authenticated, service_role;

-- 3. Business enquiries (public insert only; admins read/manage)
CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_line text NOT NULL CHECK (business_line IN ('HoReCa', 'B2B', 'White label', 'Distributorship')),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  company text NOT NULL CHECK (char_length(company) BETWEEN 1 AND 150),
  phone text NOT NULL CHECK (phone ~ '^[0-9]{10}$'),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 200),
  city text NOT NULL CHECK (char_length(city) BETWEEN 1 AND 100),
  message text CHECK (message IS NULL OR char_length(message) <= 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_enquiries_created ON enquiries(created_at DESC);
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can submit enquiries" ON enquiries;
CREATE POLICY "Public can submit enquiries" ON enquiries
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can manage enquiries" ON enquiries;
CREATE POLICY "Admins can manage enquiries" ON enquiries
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT INSERT ON enquiries TO anon;
GRANT ALL ON enquiries TO authenticated, service_role;
