import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await adminDb();
    const { data, error } = await db
      .from("promo_codes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ codes: data ?? [] });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await adminDb();
    const body = await req.json();

    const code = String(body.code ?? "").trim().toUpperCase().replace(/\s+/g, "");
    if (!code || code.length < 3) {
      return NextResponse.json({ error: "Code must be at least 3 characters." }, { status: 400 });
    }

    const discountType = body.discount_type === "fixed" ? "fixed" : "percent";
    const discountValue = Number(body.discount_value);
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return NextResponse.json({ error: "Discount value must be greater than 0." }, { status: 400 });
    }
    if (discountType === "percent" && discountValue > 100) {
      return NextResponse.json({ error: "Percentage discount can't exceed 100%." }, { status: 400 });
    }

    const maxDiscount =
      body.max_discount === "" || body.max_discount == null
        ? null
        : Number(body.max_discount);
    if (maxDiscount != null && (!Number.isFinite(maxDiscount) || maxDiscount < 0)) {
      return NextResponse.json({ error: "Max discount must be a positive number." }, { status: 400 });
    }

    const minSubtotal = Number(body.min_subtotal) || 0;
    const usageLimit = body.usage_limit === "" || body.usage_limit == null ? null : Math.max(0, parseInt(body.usage_limit, 10) || 0);

    const { data, error } = await db
      .from("promo_codes")
      .insert({
        code,
        description: String(body.description ?? "").slice(0, 200),
        discount_type: discountType,
        discount_value: discountValue,
        min_subtotal: minSubtotal,
        max_discount: maxDiscount,
        starts_at: body.starts_at || null,
        expires_at: body.expires_at || null,
        usage_limit: usageLimit,
        is_active: body.is_active !== false,
      })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A code with that name already exists." }, { status: 409 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
