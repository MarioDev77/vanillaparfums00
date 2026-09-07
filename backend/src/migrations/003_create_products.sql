CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  olfactory_family VARCHAR(100),
  description TEXT,
  top_notes TEXT,
  heart_notes TEXT,
  base_notes TEXT,
  fixation VARCHAR(100),
  projection VARCHAR(100),
  size_ml INTEGER NOT NULL DEFAULT 50,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 5,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold_out', 'inactive')),
  featured BOOLEAN NOT NULL DEFAULT false,
  best_seller BOOLEAN NOT NULL DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
