-- 1. BACKFILL: Insérer les utilisateurs manquants de auth.users vers public.profiles
INSERT INTO public.profiles (id, email, full_name, created_at)
SELECT 
    id, 
    email, 
    -- Essaye de trouver un nom, sinon utilise la partie avant @ de l'email
    COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)) as full_name,
    created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);

-- 2. TRIGGER: Assurer que tout futur utilisateur aura automatiquement un profil
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

-- Supprimer le trigger s'il existe déjà pour éviter les doublons/erreurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
