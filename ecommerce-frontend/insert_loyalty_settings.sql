INSERT INTO site_settings (key, value) 
VALUES ('loyalty', '{"earningRate": 1000, "enabled": true}'::jsonb)
ON CONFLICT (key) DO NOTHING;
