-- Final check for ALL potential missing columns in 'orders' table
do $$
begin
  -- total_amount
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'total_amount') then
    alter table public.orders add column total_amount numeric default 0;
  end if;

  -- user_email
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'user_email') then
    alter table public.orders add column user_email text;
  end if;

  -- status
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'status') then
    alter table public.orders add column status text default 'pending';
  end if;

  -- user_id (should be uuid)
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'user_id') then
    alter table public.orders add column user_id uuid references auth.users(id);
  end if;

  -- created_at (should exist, but good to check)
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'created_at') then
    alter table public.orders add column created_at timestamp with time zone default timezone('utc'::text, now()) not null;
  end if;

end $$;
