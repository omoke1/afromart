import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAdmins, notifyUser } from "@/lib/notify";
import { sendOrderStatusEmail } from "@/lib/email";

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

        const { data: order } = await admin
          .from("orders")
          .select("user_id, total")
          .eq("id", orderId)
          .maybeSingle();

        await decrementStock(admin, orderId);

        await admin.from("order_events").insert({
          order_id: orderId,
          event: "payment_confirmed",
          message: paymentIntent ? `Payment received (${paymentIntent.slice(-8)})` : "Payment received",
          actor: "system",
        });

        // Tell the customer their payment went through.
        if (order?.user_id) {
          try {
            await notifyUser(order.user_id, {
              type: "payment_confirmed",
              title: "Payment received",
              body: `Your payment for order ${orderId} was confirmed. We're preparing your delivery.`,
              link: `/account/orders/${orderId}`,
            });
          } catch (err) {
            console.error("webhook user notification failed:", err);
          }
        }
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

const LOW_STOCK_THRESHOLD = 5;

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
      .select("id, product_id, stock")
      .in("id", optionIds);
    const optionProductIds = Array.from(new Set((options ?? []).map((o) => o.product_id)));
    const { data: optionProducts } = optionProductIds.length > 0
      ? await admin.from("products").select("id, name").in("id", optionProductIds)
      : { data: [] as { id: string; name: string }[] };
    const nameMap = new Map((optionProducts ?? []).map((p) => [p.id, p.name]));

    for (const opt of options ?? []) {
      const totalQty = withOptions.filter((i) => i.option_id === opt.id).reduce((s, i) => s + i.qty, 0);
      const newStock = Math.max(0, Number(opt.stock) - totalQty);
      await admin.from("product_options").update({ stock: newStock }).eq("id", opt.id);
      if (newStock <= LOW_STOCK_THRESHOLD) {
        await checkLowStock(admin, nameMap.get(opt.product_id) ?? "Product option", newStock);
      }
    }
  }

  if (withoutOptions.length > 0) {
    const productIds = withoutOptions.map((i) => i.product_id);
    const { data: products } = await admin
      .from("products")
      .select("id, name, stock")
      .in("id", productIds);
    for (const product of products ?? []) {
      const totalQty = withoutOptions.filter((i) => i.product_id === product.id).reduce((s, i) => s + i.qty, 0);
      const newStock = Math.max(0, Number(product.stock) - totalQty);
      await admin.from("products").update({ stock: newStock }).eq("id", product.id);
      if (newStock <= LOW_STOCK_THRESHOLD) {
        await checkLowStock(admin, product.name, newStock);
      }
    }
  }
}

// Raises an admin notification + email once per product while it sits at or
// below the low-stock threshold (deduped by product name so we don't spam).
async function checkLowStock(admin: Admin, name: string, stock: number) {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const productName = name;
    const link = "/admin/products";
    await notifyAdmins({
      type: "low_stock",
      title: "Low stock alert",
      body: `${productName} is down to ${stock} unit${stock === 1 ? "" : "s"}.`,
      link,
    });
    // Best-effort email to admins (deduped client-side by a memory cache).
    if (lowStockEmailed.has(productName)) return;
    lowStockEmailed.add(productName);
    const { getAdminEmails } = await import("@/lib/notify");
    const { sendLowStockEmail } = await import("@/lib/email");
    const adminEmails = await getAdminEmails();
    if (adminEmails.length > 0) {
      await Promise.allSettled(
        adminEmails.map((email) =>
          sendLowStockEmail({ to: email, productName, stock, link: `${siteUrl}${link}` }),
        ),
      );
    }
  } catch (err) {
    console.error("low stock notification failed:", err);
  }
}

const lowStockEmailed = new Set<string>();
