-- Contas a receber são derivadas diretamente dos pedidos (não é um cadastro manual,
-- e sim um reflexo do status de pagamento de cada pedido), evitando duplicar dados
-- financeiros que já existem em `orders`.
CREATE OR REPLACE VIEW receivables_view AS
SELECT
  o.id AS order_id,
  o.order_number,
  c.name AS customer_name,
  o.total AS value,
  o.created_at::date AS reference_date,
  o.payment_method,
  CASE
    WHEN o.status IN ('pagamento_aprovado', 'em_preparacao', 'enviado', 'entregue') THEN 'recebido'
    WHEN o.status = 'cancelado' THEN 'cancelado'
    ELSE 'pendente'
  END AS status
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id;
