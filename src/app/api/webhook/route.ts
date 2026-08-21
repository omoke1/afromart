import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminEmails, notifyAdmins, notifyUser } from "@/lib/notify";
import { generateGiftCardCode } from "@/lib/pricing";
import { sendAdminNewOrderEmail } from "@/lib/email";

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

      // Gift card purchases are their own flow — mint the card + email the code.
      if (session.metadata?.type === "gift_card" && session.payment_status === "paid") {
        await mintGiftCard(admin, session);
        break;
      }

      const orderId = session.metadata?.order_id;
      if (orderId && session.payment_status === "paid") {
        // Payment confirmed — record the payment reference and decrement stock.
        const paymentIntent =
          typeof session.payment_intent === "string" ? session.payment_intent : null;

        const { data: order } = await admin
          .from("orders")
          .select("id, status, payment_intent, tracking_number, user_id, total, subtotal, delivery, discount, gift_card_code, gift_card_used, address")
          .eq("id", orderId)
          .maybeSingle();

        if (!order) break;
        if (order.status === "Preparing" && order.payment_intent === paymentIntent) break;

        const trackingNumber = order.tracking_number ?? `AFM-${orderId.replace(/-/g, "").slice(0, 10).toUpperCase()}`;

        await admin
          .from("orders")
          .update({ status: "Preparing", payment_intent: paymentIntent, tracking_number: trackingNumber })
          .eq("id", orderId);

        await decrementStock(admin, orderId);

        // Redeem promo + gift card usage now that payment is confirmed.
        if (order) {
          await redeemCodes(admin, orderId, order as { gift_card_code?: string | null; gift_card_used?: number });
        }

        await admin.from("order_events").insert({
          order_id: orderId,
          event: "payment_confirmed",
          message: paymentIntent ? `Payment received (${paymentIntent.slice(-8)})` : "Payment received",
          actor: "system",
        });

        // Announce and email the order only after Stripe confirms payment.
        try {
          const address = (order.address ?? {}) as Record<string, string | null>;
          await notifyAdmins({
            type: "new_order",
            title: "New order received",
            body: `${address.name ?? "Customer"} · £${Number(order.total).toFixed(2)}`,
            link: `/admin/orders/${orderId}`,
          });
          const adminEmails = await getAdminEmails();
          await Promise.allSettled(
            adminEmails.map((email) =>
              sendAdminNewOrderEmail({
                to: email,
                orderId,
                total: Number(order.total),
                customerName: address.name ?? "Customer",
                link: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/admin/orders/${orderId}`,
              }),
            ),
          );
        } catch (err) {
          console.error("webhook admin notification failed:", err);
        }

        // Tell the customer their payment went through (in-app + email).
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

        // Email the customer an order confirmation with their items.
        try {
          const { sendOrderConfirmationEmail } = await import("@/lib/email");
          const address = (order?.address ?? {}) as Record<string, string | null>;
          const customerName = address.name ?? "";
          const addressEmail = address.email ?? null;

          let customerEmail = addressEmail;
          if (order?.user_id) {
            const { data: profile } = await admin
              .from("profiles")
              .select("email")
              .eq("id", order.user_id)
              .maybeSingle();
            customerEmail = profile?.email ?? addressEmail;
          }

          if (customerEmail && customerName) {
            const { data: items } = await admin
              .from("order_items")
              .select("qty, unit_price, weight, products(name, emoji)")
              .eq("order_id", orderId);
            const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
            await sendOrderConfirmationEmail({
              to: customerEmail,
              customerName,
              orderId,
              items: (items ?? []).map((i) => {
                const label = i.weight ? `${i.products?.name ?? "Item"} (${i.weight})` : (i.products?.name ?? "Item");
                return { name: `${i.products?.emoji ? i.products.emoji + " " : ""}${label}`, qty: i.qty, unitPrice: Number(i.unit_price) };
              }),
              subtotal: Number(order?.subtotal ?? 0),
              delivery: Number(order?.delivery ?? 0),
              discount: Number(order?.discount ?? 0),
              total: Number(order?.total ?? 0),
              trackingNumber,
              link: `${siteUrl}/account/orders/${orderId}`,
            });
          }
        } catch (err) {
          console.error("webhook confirmation email failed:", err);
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

// Records a paid gift-card purchase and emails the code to the recipient.
async function mintGiftCard(admin: Admin, session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  const amount = Math.max(0, Number(meta.amount) || 0);
  if (amount <= 0) return;

  const code = generateGiftCardCode();
  const { error } = await admin.from("gift_cards").insert({
    code,
    original_amount: amount,
    balance: amount,
    recipient_email: meta.recipient_email ?? "",
    recipient_name: meta.recipient_name ?? null,
    sender_name: meta.sender_name ?? null,
    message: meta.message ?? null,
    stripe_payment_intent:
      typeof session.payment_intent === "string" ? session.payment_intent : null,
    status: "active",
  });
  if (error) {
    console.error("gift card insert failed:", error.message);
    return;
  }

  try {
    const { sendGiftCardEmail } = await import("@/lib/email");
    await sendGiftCardEmail({
      to: meta.recipient_email ?? "",
      recipientName: meta.recipient_name ?? null,
      senderName: meta.sender_name ?? null,
      amount,
      code,
      message: meta.message ?? null,
    });
  } catch (err) {
    console.error("gift card email failed:", err);
  }
}

// Increments a promo code's usage count and reduces a gift card's balance once
// an order that used them is actually paid for.
async function redeemCodes(admin: Admin, orderId: string, order: { gift_card_code?: string | null; gift_card_used?: number }) {
  const { data: orderRow } = await admin
    .from("orders")
    .select("discount_label")
    .eq("id", orderId)
    .maybeSingle();

  if (orderRow?.discount_label) {
    const { data: promo } = await admin
      .from("promo_codes")
      .select("id, used_count")
      .ilike("code", orderRow.discount_label)
      .maybeSingle();
    if (promo) {
      await admin
        .from("promo_codes")
        .update({ used_count: (promo.used_count ?? 0) + 1 })
        .eq("id", promo.id);
    }
  }

  const code = order.gift_card_code;
  const used = Number(order.gift_card_used ?? 0);
  if (code && used > 0) {
    const { data: card } = await admin
      .from("gift_cards")
      .select("id, balance")
      .ilike("code", code)
      .maybeSingle();
    if (card) {
      const nextBalance = Math.max(0, Number(card.balance) - used);
      await admin
        .from("gift_cards")
        .update({ balance: nextBalance, status: nextBalance === 0 ? "redeemed" : "active" })
        .eq("id", card.id);
    }
  }
}

const LOW_STOCK_THRESHOLD = 5;

// Reduce the stock of the exact variant sold (product option when one was
// chosen, otherwise the product itself). Never lets stock go negative.
async function decrementStock(admin: Admin, orderId: string) {
  const { data: items, error } = await admin
    .from("order_items")
    .select("product_id, qty, option_id")
    .eq("order_id", orderId);
  if (error || !items || items.length === 0) return;

  const productIds = Array.from(new Set(items.map((i) => i.product_id)));
  const { data: productRows } = await admin
    .from("products")
    .select("id, name, low_stock_threshold")
    .in("id", productIds);
  const thresholdMap = new Map<string, number>(
    (productRows ?? []).map((p) => [p.id, Number(p.low_stock_threshold) || LOW_STOCK_THRESHOLD]),
  );
  const nameMap = new Map<string, string>((productRows ?? []).map((p) => [p.id, p.name]));

  const withOptions = items.filter((i) => i.option_id);
  const withoutOptions = items.filter((i) => !i.option_id);

  if (withOptions.length > 0) {
    const optionIds = withOptions.map((i) => i.option_id as string);
    const { data: options } = await admin
      .from("product_options")
      .select("id, product_id, stock")
      .in("id", optionIds);

    for (const opt of options ?? []) {
      const totalQty = withOptions.filter((i) => i.option_id === opt.id).reduce((s, i) => s + i.qty, 0);
      const newStock = Math.max(0, Number(opt.stock) - totalQty);
      await admin.from("product_options").update({ stock: newStock }).eq("id", opt.id);
      const threshold = thresholdMap.get(opt.product_id) ?? LOW_STOCK_THRESHOLD;
      if (newStock <= threshold) {
        await checkLowStock(admin, nameMap.get(opt.product_id) ?? "Product option", newStock);
      }
    }
  }

  if (withoutOptions.length > 0) {
    const { data: products } = await admin
      .from("products")
      .select("id, name, stock, low_stock_threshold")
      .in("id", productIds);
    for (const product of products ?? []) {
      const totalQty = withoutOptions.filter((i) => i.product_id === product.id).reduce((s, i) => s + i.qty, 0);
      const newStock = Math.max(0, Number(product.stock) - totalQty);
      await admin.from("products").update({ stock: newStock }).eq("id", product.id);
      const threshold = Number(product.low_stock_threshold) || LOW_STOCK_THRESHOLD;
      if (newStock <= threshold) {
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
