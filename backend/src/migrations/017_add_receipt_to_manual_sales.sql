-- Guarda o link da foto do comprovante de pagamento (Pix, depósito, etc.)
-- de cada venda manual. O arquivo em si fica no Vercel Blob; aqui só
-- guardamos a URL pública gerada no upload.
ALTER TABLE manual_sales
  ADD COLUMN IF NOT EXISTS receipt_url TEXT;
