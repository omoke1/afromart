-- Per-category preset weight units (e.g. kg, paint, bag, half bag).

ALTER TABLE categories
  ADD COLUMN weight_units TEXT[] NOT NULL DEFAULT '{}';

-- Seed sensible defaults for existing categories
UPDATE categories SET weight_units = ARRAY['1 kg', '2 kg', '5 kg', '10 kg', '25 kg', 'Paint', 'Half bag', 'Quarter bag'] WHERE slug = 'grains';
UPDATE categories SET weight_units = ARRAY['1 litre', '5 litres', '25 litres'] WHERE slug = 'cooking';
UPDATE categories SET weight_units = ARRAY['50 g', '100 g', '250 g', '500 g', '1 kg'] WHERE slug = 'spices';
UPDATE categories SET weight_units = ARRAY['1 piece', 'Pack', 'Carton'] WHERE slug = 'snacks';
UPDATE categories SET weight_units = ARRAY['500 g', '1 kg', '2 kg'] WHERE slug = 'protein';
UPDATE categories SET weight_units = ARRAY['100 g', '250 g', '500 g', '1 kg'] WHERE slug = 'organic';
UPDATE categories SET weight_units = ARRAY['1 piece', 'Pack', 'Carton'] WHERE slug = 'household';
UPDATE categories SET weight_units = ARRAY['Small', 'Medium', 'Large'] WHERE slug = 'bundles';
