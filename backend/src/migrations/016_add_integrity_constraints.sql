-- Constraints de integridade que faltavam nas tabelas financeiras/comerciais.
-- Objetivo: o banco nunca deve aceitar um estado inválido, mesmo que algum
-- código futuro esqueça de validar antes do INSERT/UPDATE.
--
-- PostgreSQL não suporta "ADD CONSTRAINT IF NOT EXISTS", então o padrão
-- usado aqui é DROP CONSTRAINT IF EXISTS + ADD CONSTRAINT, o que deixa o
-- arquivo seguro de rodar mais de uma vez (idempotente).

-- order_items: sem isso, uma quantidade zero/negativa vinda do checkout
-- público conseguia manipular o subtotal e até "devolver" estoque.
ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_quantity_check;
ALTER TABLE order_items ADD CONSTRAINT order_items_quantity_check CHECK (quantity > 0);

ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_unit_price_check;
ALTER TABLE order_items ADD CONSTRAINT order_items_unit_price_check CHECK (unit_price >= 0);

-- products: preço/custo negativos ou estoque negativo não fazem sentido de
-- negócio e quebrariam os cálculos de lucro no financeiro.
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_price_check;
ALTER TABLE products ADD CONSTRAINT products_price_check CHECK (price >= 0);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_cost_check;
ALTER TABLE products ADD CONSTRAINT products_cost_check CHECK (cost >= 0);

ALTER TABLE products DROP CONSTRAINT IF EXISTS products_stock_quantity_check;
ALTER TABLE products ADD CONSTRAINT products_stock_quantity_check CHECK (stock_quantity >= 0);

-- coupons: um cupom de desconto percentual acima de 100% ou com valor
-- negativo/zero é sempre erro de cadastro, nunca um caso de uso válido.
ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_discount_value_check;
ALTER TABLE coupons ADD CONSTRAINT coupons_discount_value_check CHECK (discount_value > 0);

ALTER TABLE coupons DROP CONSTRAINT IF EXISTS coupons_percentage_max_check;
ALTER TABLE coupons ADD CONSTRAINT coupons_percentage_max_check
  CHECK (discount_type != 'percentage' OR discount_value <= 100);
