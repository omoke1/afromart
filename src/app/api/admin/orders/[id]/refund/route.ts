import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const admin = await requireAdmin();
    const db = await adminDb();

    const { data: order, error } = await db.from("orders").select("*").eq("id", id).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (!order.payment_intent) {
      return NextResponse.json(
        { error: "No recorded Stripe payment for this order, so it can't be refunded here." },
        { status: 400 },
      );
    }
    if (order.status === "Refunded") {
      return NextResponse.json({ error: "This order has already been refunded." }, { status: 400 });
    }

    await stripe.refunds.create({ payment_intent: order.payment_intent });

    const { error: updateErr } = await db.from("orders").update({ status: "Refunded" }).eq("id", id);
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

    await db.from("order_events").insert({
      order_id: id,
      event: "refunded",
      message: `Refund issued via Stripe`,
      actor: admin.email,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
