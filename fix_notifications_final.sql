-- 1. S'assurer que la table des notifications est prête
create table if not exists public.admin_notifications (
  id uuid default uuid_generate_v4() primary key,
  type text not null, -- 'order', 'user', 'alert'
  title text not null,
  message text,
  read boolean default false,
  link text,
  metadata jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Activer le Realtime pour cette table (Crucial pour la petite cloche)
begin;
  -- Supprimer si déjà présent pour éviter les doublons
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table admin_notifications;

-- 3. Fonction de notification pour les COMMANDES (Utilise la colonne 'total')
create or replace function public.handle_new_order_notification()
returns trigger as $$
begin
  begin
    insert into public.admin_notifications (type, title, message, link, read)
    values (
      'order',
      'Nouvelle commande #' || substring(new.id::text, 1, 8),
      'Une nouvelle commande de ' || coalesce(new.total, 0) || ' FCFA a été passée par ' || coalesce(new.user_email, 'un client') || '.',
      '/admin/orders',
      false
    );
  exception when others then
    -- On ne bloque jamais la commande si la notification échoue
    raise warning 'Notification Error (Order): %', SQLERRM;
  end;
  return new;
end;
$$ language plpgsql security definer;

-- 4. Fonction de notification pour les NOUVEAUX CLIENTS
create or replace function public.handle_new_user_notification()
returns trigger as $$
begin
  begin
    insert into public.admin_notifications (type, title, message, link, read)
    values (
      'user',
      'Nouveau client inscrit',
      'Le client ' || new.email || ' vient de rejoindre la plateforme.',
      '/admin/users',
      false
    );
  exception when others then
    raise warning 'Notification Error (User): %', SQLERRM;
  end;
  return new;
end;
$$ language plpgsql security definer;

-- 5. Installation des Triggers
drop trigger if exists on_new_order on public.orders;
create trigger on_new_order
  after insert on public.orders
  for each row execute procedure public.handle_new_order_notification();

drop trigger if exists on_new_user on public.profiles;
create trigger on_new_user
  after insert on public.profiles
  for each row execute procedure public.handle_new_user_notification();

-- 6. Politiques de sécurité (RLS)
alter table admin_notifications enable row level security;

drop policy if exists "Allow full access to authenticated users" on admin_notifications;
create policy "Allow full access to authenticated users" 
on admin_notifications 
for all 
using (auth.role() = 'authenticated')
with check (auth.role() = 'authenticated');
