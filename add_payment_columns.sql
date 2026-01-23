
-- Ajout des colonnes pour la gestion des paiements Jeko
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Commentaire pour se souvenir à quoi servent ces colonnes
COMMENT ON COLUMN public.orders.payment_id IS 'ID de la transaction renvoyé par Jeko';
COMMENT ON COLUMN public.orders.metadata IS 'Données supplémentaires de la transaction (ex: détails Jeko)';
