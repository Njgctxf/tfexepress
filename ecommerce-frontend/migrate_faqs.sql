-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public FAQs are viewable by everyone" 
ON faqs FOR SELECT 
USING (true);

CREATE POLICY "Admins can insert FAQs" 
ON faqs FOR INSERT 
WITH CHECK (true); -- In real app, check for admin role

CREATE POLICY "Admins can update FAQs" 
ON faqs FOR UPDATE 
USING (true);

CREATE POLICY "Admins can delete FAQs" 
ON faqs FOR DELETE 
USING (true);

-- Seed initial data from Help.jsx
INSERT INTO faqs (question, answer, display_order) VALUES
('Où est ma commande ?', 'Vous pouvez suivre l''état de votre commande en vous connectant à votre compte et en consultant la section ''Mes commandes''. Un numéro de suivi vous a également été envoyé par e-mail lors de l''expédition.', 1),
('Quels sont les délais de livraison ?', 'La livraison Standard prend généralement 2 à 4 jours ouvrables. La livraison Express est effectuée sous 24h à Abidjan. Pour l''intérieur du pays, comptez 48h à 72h.', 2),
('Comment retourner un article ?', 'Les retours sont gratuits sous 14 jours si le produit n''a pas été ouvert ou utilisé. Contactez notre service client ou initiez un retour depuis votre espace personnel.', 3),
('Quels moyens de paiement acceptez-vous ?', 'Nous acceptons les paiements par Mobile Money (Orange, MTN, Wave), les cartes bancaires (Visa, Mastercard) et le paiement à la livraison (sous conditions).', 4);
