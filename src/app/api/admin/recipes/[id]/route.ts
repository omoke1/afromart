import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await adminDb();
    const { data, error } = await db.from("recipes").select("*").eq("id", id).maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ recipe: data });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await adminDb();
    const body = await req.json();
    const { error } = await db.from("recipes").update({
      slug: body.slug || slugify(body.title),
      title: body.title,
      time: body.time,
      serves: body.serves,
      level: body.level,
      emoji: body.emoji,
      bg_color: body.bg_color,
      intro: body.intro,
      ingredients: body.ingredients,
      steps: body.steps,
    }).eq("id", id);
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
    const { error } = await db.from("recipes").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
