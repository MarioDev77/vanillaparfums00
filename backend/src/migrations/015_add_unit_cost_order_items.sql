-- Guarda o custo do produto NO MOMENTO da venda (mesmo raciocínio de
-- manual_sales.unit_cost), para que o lucro dos pedidos da loja não mude
-- retroativamente se o custo do perfume for editado depois.
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(10,2) NOT NULL DEFAULT 0;

-- Backfill dos pedidos já existentes: usa o custo atual do produto como
-- aproximação, já que não havia snapshot histórico antes desta migration.
UPDATE order_items oi
SET unit_cost = p.cost
FROM products p
WHERE p.id = oi.product_id AND oi.unit_cost = 0;
