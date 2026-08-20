-- Replace category emojis with optional image URLs.

ALTER TABLE categories
  ADD COLUMN image_url TEXT;

-- Emoji is no longer used for categories (products/subcategories keep their own).
ALTER TABLE categories
  DROP COLUMN emoji;