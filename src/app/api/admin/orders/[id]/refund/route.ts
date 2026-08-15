import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { notifyUser } from "@/lib/notify";
import { sendOrderStatusEmail } from "@/lib/email";

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

    // Notify the customer about their refund (in-app + email).
    if (order.user_id) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
        await notifyUser(order.user_id, {
          type: "refund",
          title: "Refund issued",
          body: `Your refund for order ${id} has been processed. It may take 3–5 working days to appear.`,
          link: `/account/orders/${id}`,
        });
        const { data: profile } = await db
          .from("profiles")
          .select("email")
          .eq("id", order.user_id)
          .maybeSingle();
        if (profile?.email) {
          await sendOrderStatusEmail({
            to: profile.email,
            orderId: id,
            status: "Refunded",
            total: Number(order.total),
            link: `${siteUrl}/account/orders/${id}`,
          });
        }
      } catch (err) {
        console.error("refund notification failed:", err);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
