CREATE TABLE IF NOT EXISTS settings (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(150) NOT NULL DEFAULT 'Vanilla Parfums',
  slogan VARCHAR(255) NOT NULL DEFAULT 'Sua essência. Sua presença.',
  logo_url TEXT,
  phone VARCHAR(30),
  whatsapp VARCHAR(30),
  instagram VARCHAR(100),
  address VARCHAR(255),
  shipping_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  payment_methods JSONB NOT NULL DEFAULT '["pix", "cartao"]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO settings (company_name, slogan)
SELECT 'Vanilla Parfums', 'Sua essência. Sua presença.'
WHERE NOT EXISTS (SELECT 1 FROM settings);
