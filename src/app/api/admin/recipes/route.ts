import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await adminDb();
    const { data, error } = await db.from("recipes").select("*").order("title");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ recipes: data ?? [] });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await adminDb();
    const body = await req.json();
    const { error } = await db.from("recipes").insert({
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
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
