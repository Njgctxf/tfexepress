-- Change product_id to text to accept any ID format (e.g. "12", "123", or UUIDs)
do $$
begin
  -- Check if order_items exists
  if exists (select 1 from information_schema.tables where table_name = 'order_items') then
    -- Alter the column type to text
    alter table public.order_items alter column product_id type text using product_id::text;
  end if;
end $$;
