-- Etape 1 : Ajouter les colonnes manquantes si elles n'existent pas
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loyalty_points integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS loyalty_tier text DEFAULT 'Bronze';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false;

-- Etape 2 : Insérer les utilisateurs manquants depuis auth.users
INSERT INTO public.profiles (id, email, full_name, created_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)) as full_name,
    created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- Etape 3 : Mettre à jour le trigger pour les futures inscriptions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
