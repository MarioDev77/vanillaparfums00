CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(30) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  coupon_id INTEGER REFERENCES coupons(id) ON DELETE SET NULL,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('pix', 'cartao', 'outro')),
  status VARCHAR(30) NOT NULL DEFAULT 'aguardando_pagamento' CHECK (
    status IN ('aguardando_pagamento', 'pagamento_aprovado', 'em_preparacao', 'enviado', 'entregue', 'cancelado')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
