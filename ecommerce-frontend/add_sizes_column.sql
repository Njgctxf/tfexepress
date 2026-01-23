-- Add 'sizes' column to products table
-- This allows storing multiple sizes (e.g., S, M, L or 40, 41, 42)
ALTER TABLE products ADD COLUMN IF NOT EXISTS sizes text[];

-- Verify column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'sizes';
