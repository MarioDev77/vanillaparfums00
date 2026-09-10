ALTER TABLE products ADD COLUMN IF NOT EXISTS occasion VARCHAR(150);
ALTER TABLE products ADD COLUMN IF NOT EXISTS intensity VARCHAR(20) CHECK (intensity IN ('leve', 'moderada', 'intensa'));
