-- Product options (weight variants)

CREATE TABLE IF NOT EXISTS product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  weight TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_at DECIMAL(10,2),
  stock INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_options_product ON product_options(product_id);

ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view product_options" ON product_options
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert product_options" ON product_options
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_roles));

CREATE POLICY "Admins can update product_options" ON product_options
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM admin_roles));

CREATE POLICY "Admins can delete product_options" ON product_options
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM admin_roles));

-- Order items: capture the exact weight variant purchased
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS weight TEXT NOT NULL DEFAULT '';
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS option_id UUID;

-- Backfill existing order items with the product's default weight
UPDATE order_items oi
SET weight = COALESCE(p.weight, '')
FROM products p
WHERE oi.product_id = p.id
  AND oi.weight = '';
