-- Create admin_notifications table
create table if not exists admin_notifications (
  id uuid default uuid_generate_v4() primary key,
  type text not null, -- 'order', 'user', 'alert'
  title text not null,
  message text,
  read boolean default false,
  link text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table admin_notifications enable row level security;

-- Policy: Allow all authenticated users (admins) to View/Update/Delete
-- In a stricter app, we would check for specific admin role claims
create policy "Allow full access to authenticated users" 
on admin_notifications 
for all 
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');

-- Create a helper function/trigger to auto-notify on new orders (Optional but cool)
-- For now, we'll handle insertion via backend logic or triggers on other tables later.
