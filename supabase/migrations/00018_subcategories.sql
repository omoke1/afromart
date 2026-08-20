-- Subcategories: allow grouping within a category (e.g. Protein > Fresh Fish, Beef & Goat).

CREATE TABLE subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📦',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (category_id, slug)
);

CREATE INDEX idx_subcategories_category ON subcategories(category_id);

ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view subcategories" ON subcategories FOR SELECT USING (true);

-- Add optional subcategory reference to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);

-- Seed subcategories for Protein
INSERT INTO subcategories (category_id, name, slug, emoji, position) VALUES
  ('c0010000-0000-4000-8000-000000000005', 'Fresh Fish', 'fresh-fish', '🐟', 0),
  ('c0010000-0000-4000-8000-000000000005', 'Beef & Goat', 'beef-goat', '🥩', 1),
  ('c0010000-0000-4000-8000-000000000005', 'Chicken & Turkey', 'chicken-turkey', '🍗', 2),
  ('c0010000-0000-4000-8000-000000000005', 'Smoked & Dried Fish', 'smoked-dried-fish', '🐟', 3),
  ('c0010000-0000-4000-8000-000000000005', 'Shellfish & Others', 'shellfish-others', '🦐', 4)
ON CONFLICT (category_id, slug) DO NOTHING;

-- Seed subcategories for Tubers & Grains
INSERT INTO subcategories (category_id, name, slug, emoji, position) VALUES
  ('c0010000-0000-4000-8000-000000000001', 'Rice', 'rice', '🍚', 0),
  ('c0010000-0000-4000-8000-000000000001', 'Garri & Semolina', 'garri-semolina', '🥣', 1),
  ('c0010000-0000-4000-8000-000000000001', 'Yam & Plantain', 'yam-plantain', '🍠', 2),
  ('c0010000-0000-4000-8000-000000000001', 'Beans & Legumes', 'beans-legumes', '🫘', 3),
  ('c0010000-0000-4000-8000-000000000001', 'Flour & Meal', 'flour-meal', '🌾', 4)
ON CONFLICT (category_id, slug) DO NOTHING;

-- Seed subcategories for Cooking Essentials
INSERT INTO subcategories (category_id, name, slug, emoji, position) VALUES
  ('c0010000-0000-4000-8000-000000000002', 'Palm Oil & Vegetable Oil', 'oils', '🫒', 0),
  ('c0010000-0000-4000-8000-000000000002', 'Soups & Stews', 'soups-stews', '🍲', 1),
  ('c0010000-0000-4000-8000-000000000002', 'Grains & Pastes', 'grains-pastes', '🫙', 2)
ON CONFLICT (category_id, slug) DO NOTHING;

-- Seed subcategories for Snacks & Drinks
INSERT INTO subcategories (category_id, name, slug, emoji, position) VALUES
  ('c0010000-0000-4000-8000-000000000004', 'Biscuits & Pastries', 'biscuits-pastries', '🍪', 0),
  ('c0010000-0000-4000-8000-000000000004', 'Chips & Chin Chin', 'chips-chin-chin', '🍿', 1),
  ('c0010000-0000-4000-8000-000000000004', 'Drinks & Juices', 'drinks-juices', '🥤', 2)
ON CONFLICT (category_id, slug) DO NOTHING;
