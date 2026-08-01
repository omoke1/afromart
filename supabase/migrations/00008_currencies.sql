-- Create currencies table to allow admin-managed rates and symbols
-- rate_to_base: multiplier to convert from base currency (GBP) to target currency
CREATE TABLE IF NOT EXISTS public.currencies (
  code text PRIMARY KEY,
  name text NOT NULL,
  symbol text NOT NULL,
  rate_to_base numeric NOT NULL DEFAULT 1,
  auto_update boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Seed a default GBP entry
INSERT INTO public.currencies (code, name, symbol, rate_to_base, auto_update)
VALUES ('GBP', 'Pound Sterling', '£', 1, false)
ON CONFLICT (code) DO NOTHING;
