-- Give existing products clean public URLs.
-- Duplicate or conflicting names receive a short id suffix to preserve uniqueness.

WITH normalized AS (
  SELECT
    id,
    trim(BOTH '-' FROM regexp_replace(regexp_replace(lower(name), '[^a-z0-9]+', '-', 'g'), '(^-|-$)', '', 'g')) AS base_slug
  FROM products
  WHERE slug IS NULL OR slug = ''
), ranked AS (
  SELECT
    id,
    base_slug,
    count(*) OVER (PARTITION BY base_slug) AS duplicate_count
  FROM normalized
)
UPDATE products AS p
SET slug = CASE
  WHEN r.duplicate_count > 1
    OR EXISTS (SELECT 1 FROM products AS existing WHERE existing.slug = r.base_slug AND existing.id <> r.id)
    THEN r.base_slug || '-' || left(r.id::text, 8)
  ELSE r.base_slug
END
FROM ranked AS r
WHERE p.id = r.id;
