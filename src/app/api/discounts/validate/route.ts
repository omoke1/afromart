import { NextResponse } from "next/server";
import { validatePromoCode, validateGiftCard } from "@/lib/pricing";

export const runtime = "nodejs";

// Validates a single code entered at checkout — it can be either a promo code
// or a gift card code.
export async function POST(req: Request) {
  let body: { code?: string; subtotal?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const code = String(body.code ?? "").trim();
  if (!code) {
    return NextResponse.json({ kind: null, valid: false, error: "Enter a code." });
  }

  const subtotal = Number(body.subtotal);
  const subtotalSafe = Number.isFinite(subtotal) ? subtotal : 0;

  const promo = await validatePromoCode(code, subtotalSafe);
  if (promo.valid) {
    return NextResponse.json({
      kind: "promo",
      valid: true,
      discount: promo.discount,
      label: promo.label,
      code: code.toUpperCase(),
    });
  }

  const gift = await validateGiftCard(code);
  if (gift.valid) {
    return NextResponse.json({
      kind: "gift_card",
      valid: true,
      balance: gift.balance,
      code: code.toUpperCase(),
    });
  }

  return NextResponse.json({
    kind: null,
    valid: false,
    error: "That code isn't valid. Check it and try again.",
  });
}
