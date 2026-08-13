import { NextResponse } from "next/server";
import { NotSignedInError, requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof NotSignedInError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    throw err;
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("name, phone, email, currency")
    .eq("id", user.id)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ profile: data ?? { name: null, phone: null, email: user.email, currency: null } });
}

export async function PATCH(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof NotSignedInError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    throw err;
  }

  let body: { name?: unknown; phone?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const update: { name?: string | null; phone?: string | null } = {};
  if (body.name !== undefined) {
    update.name = String(body.name).trim() || null;
  }
  if (body.phone !== undefined) {
    update.phone = String(body.phone).trim() || null;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update(update).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
