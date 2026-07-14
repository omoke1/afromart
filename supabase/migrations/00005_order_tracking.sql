-- Order tracking fields (manual until a courier integration is added)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS courier TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery DATE;
