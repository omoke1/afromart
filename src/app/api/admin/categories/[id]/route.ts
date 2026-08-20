import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";
import type { Database } from "@/lib/supabase/types";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await adminDb();
    const body = await req.json();
    const update: Database["public"]["Tables"]["categories"]["Update"] = {};
    if (body.name !== undefined) update.name = body.name;
    if (body.slug !== undefined) update.slug = body.slug;
    if (body.image_url !== undefined) update.image_url = body.image_url ?? null;
    if (body.bg_color !== undefined) update.bg_color = body.bg_color;
    if (body.description !== undefined) update.description = body.description;
    if (body.weight_units !== undefined) update.weight_units = body.weight_units ?? [];
    const { error } = await db.from("categories").update(update).eq("id", id);
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
    const { error } = await db.from("categories").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
