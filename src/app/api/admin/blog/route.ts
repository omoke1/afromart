import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await adminDb();
    const { data, error } = await db.from("blog_posts").select("*").order("date", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ posts: data ?? [] });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await adminDb();
    const body = await req.json();
    const { error } = await db.from("blog_posts").insert({
      slug: body.slug || slugify(body.title),
      title: body.title,
      excerpt: body.excerpt,
      category: body.category,
      read_time: body.read_time,
      emoji: body.emoji,
      bg_color: body.bg_color,
      author: body.author,
      date: body.date,
      body: body.body,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
