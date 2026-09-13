-- Forma de pagamento da venda manual: pix ou dinheiro em espécie.
ALTER TABLE manual_sales
  ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) NOT NULL DEFAULT 'dinheiro'
    CHECK (payment_method IN ('pix', 'dinheiro'));
