-- Add long_description field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS long_description text DEFAULT '';
