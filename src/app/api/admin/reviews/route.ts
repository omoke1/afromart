import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const db = await adminDb();
    const url = new URL(req.url);
    const pending = url.searchParams.get("pending") === "true";
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);
    const PER_PAGE = 20;

    let query = db
      .from("reviews")
      .select("id, rating, title, body, is_approved, created_at, products(name), profiles(name)", {
        count: "exact",
      });
    if (pending) query = query.eq("is_approved", false);
    query = query.order("created_at", { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ reviews: data ?? [], total: count ?? 0 });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const db = await adminDb();
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "Missing review id." }, { status: 400 });

    const { error } = await db
      .from("reviews")
      .update({ is_approved: body.is_approved === true })
      .eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const db = await adminDb();
    const body = await req.json();
    if (!body.id) return NextResponse.json({ error: "Missing review id." }, { status: 400 });

    const { error } = await db.from("reviews").delete().eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
