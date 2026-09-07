CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  gender VARCHAR(20) NOT NULL DEFAULT 'unissex' CHECK (gender IN ('masculino', 'feminino', 'unissex')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
