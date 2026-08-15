import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await adminDb();
    const body = await req.json();

    const data: {
      is_active?: boolean;
      code?: string;
      description?: string;
      discount_type?: string;
      discount_value?: number;
      min_subtotal?: number;
      max_discount?: number | null;
      starts_at?: string | null;
      expires_at?: string | null;
      usage_limit?: number | null;
    } = {};
    if (typeof body.is_active === "boolean") data.is_active = body.is_active;
    if (body.code !== undefined) {
      const code = String(body.code).trim().toUpperCase().replace(/\s+/g, "");
      if (code.length >= 3) data.code = code;
    }
    if (body.description !== undefined) data.description = String(body.description).slice(0, 200);
    if (body.discount_type === "percent" || body.discount_type === "fixed") data.discount_type = body.discount_type;
    if (body.discount_value !== undefined) {
      const v = Number(body.discount_value);
      if (Number.isFinite(v) && v > 0) data.discount_value = v;
    }
    if (body.min_subtotal !== undefined) data.min_subtotal = Number(body.min_subtotal) || 0;
    if (body.max_discount !== undefined) data.max_discount = body.max_discount === "" || body.max_discount == null ? null : Number(body.max_discount);
    if (body.starts_at !== undefined) data.starts_at = body.starts_at || null;
    if (body.expires_at !== undefined) data.expires_at = body.expires_at || null;
    if (body.usage_limit !== undefined) data.usage_limit = body.usage_limit === "" || body.usage_limit == null ? null : Math.max(0, parseInt(body.usage_limit, 10) || 0);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    const { error } = await db.from("promo_codes").update(data).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await adminDb();
    const { error } = await db.from("promo_codes").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
