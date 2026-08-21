-- Make stock nullable on products and product_options.
-- NULL  = stock not tracked (unlimited / always available)
-- 0     = explicitly out of stock
-- 1+    = in stock with this quantity

ALTER TABLE products ALTER COLUMN stock DROP NOT NULL;
ALTER TABLE products ALTER COLUMN stock DROP DEFAULT;

ALTER TABLE product_options ALTER COLUMN stock DROP NOT NULL;
ALTER TABLE product_options ALTER COLUMN stock DROP DEFAULT;
