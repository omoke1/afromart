-- Keep unpaid checkout records separate from paid orders.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders
  ADD CONSTRAINT orders_status_check
  CHECK (status IN ('Pending payment', 'Preparing', 'Out for delivery', 'Delivered', 'Cancelled'));
