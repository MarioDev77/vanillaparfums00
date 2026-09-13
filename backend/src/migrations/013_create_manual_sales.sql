-- Vendas registradas manualmente (WhatsApp, Instagram, presencial etc.),
-- separadas dos pedidos do checkout online (tabela `orders`).
-- `unit_cost` guarda o custo do perfume NO MOMENTO da venda, para que o
-- lucro histórico não mude se o custo do produto for editado depois.
CREATE TABLE IF NOT EXISTS manual_sales (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  customer_name VARCHAR(150) NOT NULL,
  contact VARCHAR(100),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_date DATE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pago', 'pendente')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_manual_sales_product ON manual_sales(product_id);
CREATE INDEX IF NOT EXISTS idx_manual_sales_sale_date ON manual_sales(sale_date);
