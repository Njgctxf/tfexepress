-- Add metadata and shipping_address columns if they don't exist
do $$
begin
  -- Add metadata column (for extra info like points value, subtotal)
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'metadata') then
    alter table public.orders add column metadata jsonb default '{}'::jsonb;
  end if;

  -- Add shipping_address column (just in case)
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'shipping_address') then
    alter table public.orders add column shipping_address jsonb;
  end if;

  -- Ensure payment_method exists
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'payment_method') then
    alter table public.orders add column payment_method text;
  end if;
end $$;
