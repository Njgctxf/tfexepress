-- Create a table for admin profiles
create table if not exists public.admin_profiles (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  first_name text null,
  last_name text null,
  email text null,
  role text null default 'Admin'::text,
  avatar text null,
  constraint admin_profiles_pkey primary key (id)
);

-- Insert a default admin user if table is empty
insert into public.admin_profiles (first_name, last_name, email, role, avatar)
select 'Admin', 'User', 'admin@tfexpress.com', 'Super Admin', null
where not exists (select 1 from public.admin_profiles);

-- Enable Row Level Security (RLS)
alter table public.admin_profiles enable row level security;

-- Policy: Allow ALL access to EVERYONE (Public + Anon)
-- CAUTION: Dev only.
drop policy if exists "Allow all access to admin_profiles" on public.admin_profiles;

create policy "Allow all access to admin_profiles"
on public.admin_profiles
for all
to public
using (true)
with check (true);

-- Grant permissions explicitly
grant all on table public.admin_profiles to anon;
grant all on table public.admin_profiles to authenticated;
grant all on table public.admin_profiles to service_role;
