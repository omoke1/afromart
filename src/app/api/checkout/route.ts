import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateShippingFee, parseWeightKg } from "@/lib/weight";
import type { Json } from "@/lib/supabase/types";

type IncomingLine = { productId: string; optionId?: string | null; qty: number };

type Address = {
  email: string;
  phone: string;
  name: string;
  address1: string;
  address2?: string;
  city: string;
  postcode: string;
  country: string;
};

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: "Payments are not configured yet. Add your Stripe keys to .env.local." },
      { status: 500 },
    );
  }

  let body: { lines?: IncomingLine[]; address?: Address };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const lines = (body.lines ?? []).filter((l) => l.productId && l.qty > 0);
  const address = body.address;

  if (lines.length === 0) {
    return NextResponse.json({ error: "Your basket is empty." }, { status: 400 });
  }
  if (!address?.email || !address.name || !address.address1 || !address.postcode) {
    return NextResponse.json({ error: "Missing delivery details." }, { status: 400 });
  }

  // Who is checking out (optional — guest checkout allowed)
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Re-fetch real prices server-side — never trust client-sent prices.
  const admin = createAdminClient();
  const ids = lines.map((l) => l.productId);
  const [{ data: settingsData }, { data: products, error: prodErr }] = await Promise.all([
    admin.from("shipping_settings").select("*").eq("id", "default").maybeSingle(),
    admin
      .from("products")
      .select("id, name, price, emoji, stock, weight, product_options(id, weight, price, stock)")
      .in("id", ids),
  ]);

  const shippingSettings = settingsData ?? {
    id: "default",
    base_fee: 4.99,
    per_kg_fee: 1.25,
    free_delivery_threshold: 40,
    enabled: true,
  };

  if (prodErr || !products || products.length === 0) {
    return NextResponse.json({ error: "Could not load products." }, { status: 500 });
  }

  type Option = { id: string; weight: string; price: number; stock: number };
  const priceById = new Map(products.map((p) => [p.id, p]));

  // Build verified line items and accumulate shipping weight.
  let subtotalPence = 0;
  let totalKg = 0;
  const stripeLineItems: {
    quantity: number;
    price_data: {
      currency: string;
      unit_amount: number;
      product_data: { name: string };
    };
  }[] = [];
  const orderItems: { product_id: string; qty: number; unit_price: number; weight: string; option_id: string | null }[] = [];

  for (const line of lines) {
    const product = priceById.get(line.productId);
    if (!product) continue;

    const option = line.optionId
      ? ((product.product_options as unknown as Option[] | null) ?? []).find((o) => o.id === line.optionId)
      : undefined;

    const unitPrice = option ? Number(option.price) : Number(product.price);
    const weight = option?.weight ?? ((product.weight as string | null) ?? "");
    const unitPence = Math.round(unitPrice * 100);
    subtotalPence += unitPence * line.qty;

    const label = weight ? `${product.name} (${weight})` : product.name;
    stripeLineItems.push({
      quantity: line.qty,
      price_data: {
        currency: "gbp",
        unit_amount: unitPence,
        product_data: { name: `${product.emoji ? product.emoji + " " : ""}${label}` },
      },
    });
    orderItems.push({
      product_id: product.id,
      qty: line.qty,
      unit_price: unitPrice,
      weight,
      option_id: option?.id ?? null,
    });

    const parsedKg = parseWeightKg(weight);
    if (parsedKg !== null) {
      totalKg += parsedKg * line.qty;
    }
  }

  if (stripeLineItems.length === 0) {
    return NextResponse.json({ error: "No valid products in basket." }, { status: 400 });
  }

  const shippingFeePence = !shippingSettings.enabled || subtotalPence >= Math.round(shippingSettings.free_delivery_threshold * 100)
    ? 0
    : Math.round(calculateShippingFee(totalKg, shippingSettings) * 100);
  const totalPence = subtotalPence + shippingFeePence;

  // Create a pending order first so we can reconcile via webhook
  const orderId = crypto.randomUUID();
  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      id: orderId,
      user_id: user?.id ?? null,
      status: "Preparing",
      subtotal: subtotalPence / 100,
      delivery: shippingFeePence / 100,
      total: totalPence / 100,
      address: address as unknown as Json,
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return NextResponse.json(
      { error: "Could not create order.", detail: orderErr?.message },
      { status: 500 },
    );
  }

  const { error: itemsErr } = await admin
    .from("order_items")
    .insert(
      orderItems.map((it) => ({ id: crypto.randomUUID(), ...it, order_id: order.id })),
    );

  if (itemsErr) {
    return NextResponse.json(
      { error: "Could not save order items.", detail: itemsErr.message },
      { status: 500 },
    );
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;

  // Add delivery as its own line item when charged
  if (shippingFeePence > 0) {
    stripeLineItems.push({
      quantity: 1,
      price_data: {
        currency: "gbp",
        unit_amount: shippingFeePence,
        product_data: { name: "Delivery (24–48h UK)" },
      },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: stripeLineItems,
    customer_email: address.email,
    success_url: `${siteUrl}/order/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout?cancelled=1`,
    metadata: {
      order_id: order.id,
      user_id: user?.id ?? "guest",
    },
    shipping_address_collection: { allowed_countries: ["GB"] },
  });

  return NextResponse.json({ url: session.url });
}
