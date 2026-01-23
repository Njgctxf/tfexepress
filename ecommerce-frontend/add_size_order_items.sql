
-- Ajout de la colonne 'size' à la table 'order_items' pour sauvegarder la taille choisie lors de la commande

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'order_items' 
        AND column_name = 'size'
    ) THEN
        ALTER TABLE order_items
        ADD COLUMN size text;
    END IF;
END $$;
