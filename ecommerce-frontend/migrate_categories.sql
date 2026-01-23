-- 1. Add new columns to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_key TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Clean up duplicates if any (Optional - assumes uniqueness on name for now)
-- DELETE FROM categories a USING categories b WHERE a.id > b.id AND a.name = b.name;

-- 3. Populate existing categories with slugs and icons (Based on categoryUI.js)
-- Electronics
UPDATE categories SET slug = 'telephones', icon_key = 'Smartphone' WHERE name ILIKE '%téléphone%' OR name ILIKE '%smartphone%';
UPDATE categories SET slug = 'tablettes', icon_key = 'Tablet' WHERE name ILIKE '%tablette%';
UPDATE categories SET slug = 'informatique', icon_key = 'Laptop' WHERE name ILIKE '%ordinateur%' OR name ILIKE '%informatique%' OR name ILIKE '%pc%';
UPDATE categories SET slug = 'photo', icon_key = 'Camera' WHERE name ILIKE '%photo%' OR name ILIKE '%caméra%';
UPDATE categories SET slug = 'audio', icon_key = 'Headphones' WHERE name ILIKE '%audio%' OR name ILIKE '%casque%' OR name ILIKE '%écouteur%';
UPDATE categories SET slug = 'enceintes', icon_key = 'Speaker' WHERE name ILIKE '%enceinte%' OR name ILIKE '%haut-parleur%';
UPDATE categories SET slug = 'tv', icon_key = 'Tv' WHERE name ILIKE '%télévision%' OR name ILIKE '%tv%';

-- Fashion
UPDATE categories SET slug = 'vetements', icon_key = 'Shirt' WHERE name ILIKE '%vêtement%' OR name ILIKE '%mode%';
UPDATE categories SET slug = 'chaussures', icon_key = 'Footprints' WHERE name ILIKE '%chaussure%';
UPDATE categories SET slug = 'accessoires', icon_key = 'Gem' WHERE name ILIKE '%accessoire%' OR name ILIKE '%bijou%';
UPDATE categories SET slug = 'montres', icon_key = 'Watch' WHERE name ILIKE '%montre%';
UPDATE categories SET slug = 'sacs', icon_key = 'ShoppingBag' WHERE name ILIKE '%sac%';

-- Home & Beauty
UPDATE categories SET slug = 'maison', icon_key = 'Home' WHERE name ILIKE '%maison%';
UPDATE categories SET slug = 'meubles', icon_key = 'Armchair' WHERE name ILIKE '%meuble%';
UPDATE categories SET slug = 'beaute', icon_key = 'Sparkles' WHERE name ILIKE '%beauté%';
UPDATE categories SET slug = 'maquillage', icon_key = 'Palette' WHERE name ILIKE '%maquillage%';
UPDATE categories SET slug = 'parfum', icon_key = 'SprayCan' WHERE name ILIKE '%parfum%';
UPDATE categories SET slug = 'sante', icon_key = 'Heart' WHERE name ILIKE '%santé%';

-- Hobbies
UPDATE categories SET slug = 'jeux', icon_key = 'Gamepad2' WHERE name ILIKE '%jeu%' OR name ILIKE '%console%' OR name ILIKE '%gaming%';
UPDATE categories SET slug = 'sport', icon_key = 'Dumbbell' WHERE name ILIKE '%sport%';
UPDATE categories SET slug = 'auto', icon_key = 'Car' WHERE name ILIKE '%auto%' OR name ILIKE '%voiture%';

-- 4. Set fallback for any remaining rows
UPDATE categories SET slug = LOWER(REPLACE(name, ' ', '-')), icon_key = 'Grid' WHERE slug IS NULL;
