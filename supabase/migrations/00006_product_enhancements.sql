-- Product enhancements: images, featured, active status, slug

-- New columns
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured_position INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS slug TEXT;

-- Unique slug (partial — only non-null slugs)
CREATE UNIQUE INDEX IF NOT EXISTS products_slug_idx ON products(slug) WHERE slug IS NOT NULL;

-- Product images table (for future gallery support)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  alt TEXT DEFAULT '',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product images are viewable by everyone" ON product_images
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert product images" ON product_images
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_roles));

CREATE POLICY "Admins can update product images" ON product_images
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM admin_roles));

CREATE POLICY "Admins can delete product images" ON product_images
  FOR DELETE USING (auth.uid() IN (SELECT user_id FROM admin_roles));

-- Auto-assign featured badges based on is_featured flag
-- (handled in application layer, not SQL trigger)

-- Storage bucket note:
-- Create a 'product-images' bucket in Supabase Dashboard > Storage:
-- 1. Go to Storage > New bucket
-- 2. Name: product-images
-- 3. Public: yes
-- 4. File size limit: 5 MB
-- 5. Allowed MIME types: image/png, image/jpeg, image/webp, image/gif
