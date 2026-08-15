import { createAdminClient } from "@/lib/supabase/admin";

export type PromoResult =
  | { valid: true; discount: number; label: string }
  | { valid: false; error: string };

// Validates a promo code against a pre-discount subtotal and returns the
// amount it discounts. All math happens server-side.
export async function validatePromoCode(
  code: string,
  subtotal: number,
): Promise<PromoResult> {
  const clean = (code ?? "").trim().toUpperCase();
  if (!clean) return { valid: false, error: "Enter a promo code." };

  const admin = createAdminClient();
  const { data } = await admin
    .from("promo_codes")
    .select("discount_type, discount_value, min_subtotal, max_discount, starts_at, expires_at, usage_limit, used_count, is_active")
    .ilike("code", clean)
    .maybeSingle();

  if (!data) return { valid: false, error: "That promo code isn't valid." };
  if (!data.is_active) return { valid: false, error: "That promo code isn't active." };

  const now = Date.now();
  if (data.starts_at && new Date(data.starts_at).getTime() > now) {
    return { valid: false, error: "This code isn't active yet." };
  }
  if (data.expires_at && new Date(data.expires_at).getTime() < now) {
    return { valid: false, error: "This code has expired." };
  }
  if (data.usage_limit != null && (data.used_count ?? 0) >= data.usage_limit) {
    return { valid: false, error: "This code has reached its usage limit." };
  }
  if (subtotal < Number(data.min_subtotal ?? 0)) {
    return {
      valid: false,
      error: `Spend at least £${Number(data.min_subtotal).toFixed(2)} to use this code.`,
    };
  }

  let discount =
    data.discount_type === "percent"
      ? subtotal * (Number(data.discount_value) / 100)
      : Number(data.discount_value);

  if (data.discount_type === "percent" && data.max_discount != null && discount > Number(data.max_discount)) {
    discount = Number(data.max_discount);
  }

  discount = Math.round(discount * 100) / 100;

  return {
    valid: true,
    discount,
    label:
      data.discount_type === "percent"
        ? `${Number(data.discount_value)}% off`
        : `£${Number(data.discount_value).toFixed(2)} off`,
  };
}

export type GiftCardResult =
  | { valid: true; balance: number }
  | { valid: false; error: string };

export async function validateGiftCard(code: string): Promise<GiftCardResult> {
  const clean = (code ?? "").trim().toUpperCase();
  if (!clean) return { valid: false, error: "Enter a gift card code." };

  const admin = createAdminClient();
  const { data } = await admin
    .from("gift_cards")
    .select("balance, status")
    .ilike("code", clean)
    .maybeSingle();

  if (!data) return { valid: false, error: "That gift card code isn't valid." };
  if (data.status !== "active") return { valid: false, error: "That gift card has already been used." };

  const balance = Number(data.balance);
  if (balance <= 0) return { valid: false, error: "That gift card has no balance left." };

  return { valid: true, balance };
}

export function generateGiftCardCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const part = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `AFM-${part(4)}-${part(4)}-${part(4)}`;
}
