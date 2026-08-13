-- Product detail enhancements: long description + curated related products

ALTER TABLE products ADD COLUMN IF NOT EXISTS description_long TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS related_products (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (product_id, related_id)
);

ALTER TABLE related_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view related products"
  ON related_products FOR SELECT USING (true);
