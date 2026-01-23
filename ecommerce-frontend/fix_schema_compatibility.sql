-- Recreate order_items with correct types to match 'orders' table (BigInt)
drop table if exists public.order_items;

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint references public.orders(id) on delete cascade not null,
  product_id uuid, -- Assuming products use UUID, safe to keep or allow null
  name text,
  quantity integer default 1,
  price numeric,
  variant text,
  image text
);

-- Enable RLS just in case project requires it (public access for now)
alter table public.order_items enable row level security;
create policy "Allow access" on public.order_items for all using (true) with check (true);
