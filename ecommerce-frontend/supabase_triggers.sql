-- Function to handle new order notifications
create or replace function public.handle_new_order_notification()
returns trigger as $$
begin
  insert into public.admin_notifications (type, title, message, link, read)
  values (
    'order',
    'Nouvelle commande #' || substring(new.id::text, 1, 8),
    'Une nouvelle commande de ' || new.total_amount || ' FCFA a été passée.',
    '/admin/orders?highlight=' || new.id,
    false
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for Orders
drop trigger if exists on_new_order on public.orders;
create trigger on_new_order
  after insert on public.orders
  for each row execute procedure public.handle_new_order_notification();


-- Function to handle new user notifications
create or replace function public.handle_new_user_notification()
returns trigger as $$
begin
  insert into public.admin_notifications (type, title, message, link, read)
  values (
    'user',
    'Nouveau client inscrit',
    'Le client ' || new.email || ' vient de s''inscrire.',
    '/admin/users',
    false
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for Profiles (Users)
drop trigger if exists on_new_user on public.profiles;
create trigger on_new_user
  after insert on public.profiles
  for each row execute procedure public.handle_new_user_notification();
