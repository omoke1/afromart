import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payments are not configured yet." },
      { status: 500 },
    );
  }

  let body: {
    amount?: number;
    recipientEmail?: string;
    recipientName?: string;
    senderName?: string;
    message?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount < 5 || amount > 500) {
    return NextResponse.json(
      { error: "Gift card amounts must be between £5 and £500." },
      { status: 400 },
    );
  }

  const recipientEmail = String(body.recipientEmail ?? "").trim();
  if (!/^\S+@\S+\.\S+$/.test(recipientEmail)) {
    return NextResponse.json({ error: "Please enter a valid recipient email." }, { status: 400 });
  }

  const metadata = {
    type: "gift_card",
    amount: String(Math.round(amount * 100) / 100),
    recipient_email: recipientEmail,
    recipient_name: String(body.recipientName ?? "").trim().slice(0, 120) || null,
    sender_name: String(body.senderName ?? "").trim().slice(0, 120) || null,
    message: String(body.message ?? "").trim().slice(0, 500) || null,
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: Math.round(amount * 100),
          product_data: {
            name: `AfroMart Gift Card (£${Math.round(amount).toString()})`,
            description: `Digital gift card for ${recipientEmail}${metadata.recipient_name ? ` (${metadata.recipient_name})` : ""}`,
          },
        },
      },
    ],
    success_url: `${siteUrl}/gift-cards?success=1`,
    cancel_url: `${siteUrl}/gift-cards?cancelled=1`,
    metadata,
  });

  return NextResponse.json({ url: session.url });
}
