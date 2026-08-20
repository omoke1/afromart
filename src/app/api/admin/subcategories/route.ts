import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const db = await adminDb();
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category_id");

    let query = db.from("subcategories").select("*").order("position");
    if (categoryId) query = query.eq("category_id", categoryId);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ subcategories: data ?? [] });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await adminDb();
    const body = await req.json();
    const { error } = await db.from("subcategories").insert({
      category_id: body.category_id,
      name: body.name,
      slug: body.slug,
      emoji: body.emoji ?? "📦",
      position: body.position ?? 0,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
