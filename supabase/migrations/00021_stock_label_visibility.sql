-- Control stock-status label visibility at category and product level.

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS show_stock_status BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS stock_label_visibility TEXT NOT NULL DEFAULT 'category';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'products_stock_label_visibility_check'
  ) THEN
    ALTER TABLE products
      ADD CONSTRAINT products_stock_label_visibility_check
      CHECK (stock_label_visibility IN ('category', 'show', 'hide'));
  END IF;
END $$;
