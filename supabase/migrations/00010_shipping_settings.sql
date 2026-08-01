-- Add shipping settings table so admin can manage shipping price and thresholds.
CREATE TABLE IF NOT EXISTS public.shipping_settings (
  id text PRIMARY KEY,
  base_fee numeric NOT NULL DEFAULT 4.99,
  per_kg_fee numeric NOT NULL DEFAULT 1.25,
  free_delivery_threshold numeric NOT NULL DEFAULT 40,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.shipping_settings (id, base_fee, per_kg_fee, free_delivery_threshold, enabled)
VALUES ('default', 4.99, 1.25, 40, true)
ON CONFLICT (id) DO NOTHING;
