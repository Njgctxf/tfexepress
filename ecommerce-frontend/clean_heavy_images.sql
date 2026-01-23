-- CLEANUP SCRIPT
-- Detects and removes huge Base64 strings from the images column.
-- Updates products where the text representation of the images array is larger than 10KB (URLs are usually <200 chars).
-- This preserves products that have normal URLs.

UPDATE products
SET images = NULL
WHERE length(images::text) > 10000;

-- Optional: Reset them to an empty array instead of NULL if your frontend prefers []
-- UPDATE products SET images = '[]'::jsonb WHERE images IS NULL;
