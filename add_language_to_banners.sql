
-- Ajout de la colonne langue aux bannières
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'all';

-- Mettre à jour les bannières existantes en 'fr' (ou 'all' si vous préférez qu'elles s'affichent partout)
UPDATE public.banners SET language = 'fr' WHERE language = 'all';

-- Commentaire pour l'admin
COMMENT ON COLUMN public.banners.language IS 'fr, en, ou all pour s''afficher dans toutes les langues';
