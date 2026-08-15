-- Reviews, promo codes, gift cards, abandoned-cart reminders, order discounts
-- and per-product low-stock thresholds.

-- ── Product reviews ───────────────────────────────────────────────
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL DEFAULT '',
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, user_id)
);

CREATE INDEX idx_reviews_product ON reviews(product_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view approved reviews" ON reviews FOR SELECT USING (is_approved);
CREATE POLICY "Users can insert own reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);

-- ── Promo codes ───────────────────────────────────────────────────
CREATE TABLE promo_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  discount_type TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent', 'fixed')),
  discount_value NUMERIC(10,2) NOT NULL,
  min_subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(10,2),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(is_active);

ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- ── Gift cards ────────────────────────────────────────────────────
CREATE TABLE gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  original_amount NUMERIC(10,2) NOT NULL,
  balance NUMERIC(10,2) NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_name TEXT,
  sender_name TEXT,
  message TEXT,
  stripe_payment_intent TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'redeemed', 'expired', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_gift_cards_balance ON gift_cards(status);

ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

-- ── Abandoned-cart reminders ──────────────────────────────────────
CREATE TABLE cart_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_cart_reminders_user ON cart_reminders(user_id);

ALTER TABLE cart_reminders ENABLE ROW LEVEL SECURITY;

-- ── Order discount columns ────────────────────────────────────────
ALTER TABLE orders ADD COLUMN discount NUMERIC(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN discount_label TEXT;
ALTER TABLE orders ADD COLUMN gift_card_code TEXT;
ALTER TABLE orders ADD COLUMN gift_card_used NUMERIC(10,2) NOT NULL DEFAULT 0;

-- ── Per-product low-stock threshold ───────────────────────────────
ALTER TABLE products ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER NOT NULL DEFAULT 5;
