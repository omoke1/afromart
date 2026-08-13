import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/auth";
import type { Json } from "@/lib/supabase/types";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await adminDb();

    const orderRes = await db.from("orders").select("*").eq("id", id).maybeSingle();
    if (orderRes.error) return NextResponse.json({ error: orderRes.error.message }, { status: 500 });
    if (!orderRes.data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [itemsRes, productsRes, eventsRes] = await Promise.all([
      db.from("order_items").select("*").eq("order_id", id),
      db.from("products").select("id, name, emoji"),
      db.from("order_events").select("*").eq("order_id", id).order("created_at", { ascending: false }),
    ]);
    if (itemsRes.error) return NextResponse.json({ error: itemsRes.error.message }, { status: 500 });
    if (productsRes.error) return NextResponse.json({ error: productsRes.error.message }, { status: 500 });

    const productMap: Record<string, { name: string; emoji: string }> = {};
    for (const p of productsRes.data ?? []) {
      productMap[p.id] = { name: p.name, emoji: p.emoji };
    }

    let customer: { name: string | null; email: string | null; phone: string | null } | null = null;
    const userId = orderRes.data.user_id as string | null;
    if (userId) {
      const profileRes = await db.from("profiles").select("name, email, phone").eq("id", userId).maybeSingle();
      if (!profileRes.error && profileRes.data) customer = profileRes.data;
    }

    return NextResponse.json({
      order: { ...orderRes.data, items: itemsRes.data ?? [] },
      products: productMap,
      customer,
      events: eventsRes.data ?? [],
    });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const admin = await requireAdmin();
    const db = await adminDb();
    const body = await req.json();

    const { data: current } = await db.from("orders").select("*").eq("id", id).maybeSingle();
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const update: Record<string, unknown> = {};
    const events: { event: string; message: string }[] = [];

    if (typeof body.status === "string") {
      if (body.status !== current.status) {
        update.status = body.status;
        events.push({ event: "status_changed", message: `${current.status} → ${body.status}` });
      }
    }
    if (body.courier !== undefined) update.courier = body.courier || null;
    if (body.tracking_number !== undefined) update.tracking_number = body.tracking_number || null;
    if (body.estimated_delivery !== undefined) update.estimated_delivery = body.estimated_delivery || null;

    const wasDispatched = !current.tracking_number && (update.tracking_number || current.tracking_number);
    if (wasDispatched) {
      events.push({
        event: "dispatched",
        message: `Dispatched${update.courier ? ` via ${update.courier}` : ""} · ${update.tracking_number || current.tracking_number}`,
      });
    }

    if (body.address && typeof body.address === "object") {
      const merged = { ...((current.address as Record<string, unknown>) ?? {}), ...body.address };
      update.address = merged as Json;
      events.push({ event: "address_updated", message: "Delivery details updated" });
    }

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }

    const { error } = await db.from("orders").update(update as never).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (events.length > 0) {
      await db.from("order_events").insert(
        events.map((e) => ({ order_id: id, event: e.event, message: e.message, actor: admin.email })),
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
