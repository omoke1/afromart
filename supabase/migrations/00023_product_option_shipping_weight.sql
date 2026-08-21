-- Keep the customer-facing pack label separate from its shipping weight.

ALTER TABLE product_options
  ADD COLUMN IF NOT EXISTS shipping_weight_kg DECIMAL(10,3);
