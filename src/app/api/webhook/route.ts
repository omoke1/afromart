import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe needs the raw body to verify the signature.
export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook not configured." }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: `Webhook verification failed: ${message}` }, { status: 400 });
  }

  const admin = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (orderId && session.payment_status === "paid") {
        // Payment confirmed — record the payment reference and decrement stock.
        const paymentIntent =
          typeof session.payment_intent === "string" ? session.payment_intent : null;

        await admin
          .from("orders")
          .update({ status: "Preparing", payment_intent: paymentIntent })
          .eq("id", orderId);

        await decrementStock(admin, orderId);

        await admin.from("order_events").insert({
          order_id: orderId,
          event: "payment_confirmed",
          message: paymentIntent ? `Payment received (${paymentIntent.slice(-8)})` : "Payment received",
          actor: "system",
        });
      }
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.order_id;
      if (orderId) {
        await admin.from("orders").update({ status: "Cancelled" }).eq("id", orderId);
        await admin.from("order_events").insert({
          order_id: orderId,
          event: "cancelled",
          message: "Checkout expired before payment",
          actor: "system",
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}

type Admin = ReturnType<typeof createAdminClient>;

// Reduce the stock of the exact variant sold (product option when one was
// chosen, otherwise the product itself). Never lets stock go negative.
async function decrementStock(admin: Admin, orderId: string) {
  const { data: items, error } = await admin
    .from("order_items")
    .select("product_id, qty, option_id")
    .eq("order_id", orderId);
  if (error || !items || items.length === 0) return;

  const withOptions = items.filter((i) => i.option_id);
  const withoutOptions = items.filter((i) => !i.option_id);

  if (withOptions.length > 0) {
    const optionIds = withOptions.map((i) => i.option_id as string);
    const { data: options } = await admin
      .from("product_options")
      .select("id, stock")
      .in("id", optionIds);
    for (const opt of options ?? []) {
      const totalQty = withOptions.filter((i) => i.option_id === opt.id).reduce((s, i) => s + i.qty, 0);
      const newStock = Math.max(0, Number(opt.stock) - totalQty);
      await admin.from("product_options").update({ stock: newStock }).eq("id", opt.id);
    }
  }

  if (withoutOptions.length > 0) {
    const productIds = withoutOptions.map((i) => i.product_id);
    const { data: products } = await admin
      .from("products")
      .select("id, stock")
      .in("id", productIds);
    for (const product of products ?? []) {
      const totalQty = withoutOptions.filter((i) => i.product_id === product.id).reduce((s, i) => s + i.qty, 0);
      const newStock = Math.max(0, Number(product.stock) - totalQty);
      await admin.from("products").update({ stock: newStock }).eq("id", product.id);
    }
  }
}
