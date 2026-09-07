CREATE TABLE IF NOT EXISTS payables (
  id SERIAL PRIMARY KEY,
  description VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (
    category IN ('fornecedores', 'embalagens', 'marketing', 'frete', 'operacional', 'outros')
  ),
  value NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
