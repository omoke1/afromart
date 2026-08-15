-- Remove all demo products so real inventory can be uploaded via the admin dashboard.
-- Safe: only deletes the demo seed IDs (a0010000-...). Products created via the admin
-- use random UUIDs and are unaffected. Child rows (product_options, product_details,
-- related products, wishlist/cart entries) cascade.
DELETE FROM products WHERE id LIKE 'a0010000-0000-4000-8000-0000000000%';
