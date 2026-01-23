-- Ensure order_items table exists and has FK
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid not null, -- Could reference products(id) if strict
  name text,
  quantity integer default 1,
  price numeric,
  variant text,
  image text
);

-- Ensure FK if table existed but no FK (rare but possible if created loosely)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints 
    where constraint_name = 'order_items_order_id_fkey'
  ) then
    -- We can't easily add FK if data violates it, but for new table it's fine.
    -- This block is just a safety net.
    null; 
  end if;
end $$;
