-- 1. Ensure 'sold' column exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS sold INTEGER DEFAULT 0;

-- 2. Recalculate 'sold' for all products
-- We use COALESCE to default quantity to 1 if it's missing (which seems to be the case)
WITH sales_counts AS (
    SELECT 
        (item->>'id')::text as product_id,
        SUM(COALESCE((item->>'quantity')::int, 1)) as total_sold
    FROM orders, 
    jsonb_array_elements(items) as item 
    WHERE status != 'cancelled' AND status != 'Annulé'
    GROUP BY (item->>'id')::text
)
UPDATE products
SET sold = COALESCE(sc.total_sold, 0)
FROM sales_counts sc
WHERE products.id::text = sc.product_id;

-- 3. Update the trigger function to also use default quantity
CREATE OR REPLACE FUNCTION update_product_sales_count()
RETURNS TRIGGER AS $$
DECLARE
    item jsonb;
    qty int;
BEGIN
    -- Only proceed if status is not cancelled
    IF NEW.status != 'cancelled' AND NEW.status != 'Annulé' THEN
        FOR item IN SELECT * FROM jsonb_array_elements(NEW.items)
        LOOP
            -- Default to 1 if quantity is missing
            qty := COALESCE((item->>'quantity')::int, 1);
            
            UPDATE products
            SET sold = sold + qty
            WHERE id::text = (item->>'id')::text;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Re-create the trigger to be sure
DROP TRIGGER IF EXISTS trigger_update_sales_count ON orders;
CREATE TRIGGER trigger_update_sales_count
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION update_product_sales_count();
