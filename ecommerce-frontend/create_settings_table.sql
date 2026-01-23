
-- Create site_settings table
CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Allow read for everyone (so frontend can get shipping fees etc)
CREATE POLICY "Enable read access for all users" ON site_settings
    FOR SELECT USING (true);

-- Allow write only for authenticated admins
CREATE POLICY "Enable write access for authenticated users only" ON site_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert initial defaults
INSERT INTO site_settings (key, value) VALUES
('general', '{"siteName": "TFExpress", "supportEmail": "contact@tfexpress.com", "currency": "EUR"}'::jsonb),
('shipping', '{"standard": 1500, "freeThreshold": 50000}'::jsonb),
('payments', '{"stripeEnabled": true, "stripePublicKey": "", "stripeSecretKey": "", "paypalEnabled": false}'::jsonb),
('loyalty', '{"earningRate": 1000, "enabled": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;
