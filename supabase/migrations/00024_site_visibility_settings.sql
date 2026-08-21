CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY,
  show_catalog_nav BOOLEAN NOT NULL DEFAULT false,
  show_product_breadcrumbs BOOLEAN NOT NULL DEFAULT false,
  show_product_categories BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO site_settings (id) VALUES ('default') ON CONFLICT (id) DO NOTHING;

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view site_settings" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can update site_settings" ON site_settings
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM admin_roles));
