import { NextResponse } from "next/server";
import { NotSignedInError, requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof NotSignedInError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    throw err;
  }
  const { id } = await params;

  const admin = createAdminClient();
  const { error: clearErr } = await admin
    .from("payment_methods")
    .update({ is_default: false })
    .eq("user_id", user.id)
    .neq("id", id);
  if (clearErr) return NextResponse.json({ error: clearErr.message }, { status: 500 });

  const { error } = await admin
    .from("payment_methods")
    .update({ is_default: true })
    .eq("id", id)
    .eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof NotSignedInError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    throw err;
  }
  const { id } = await params;

  const admin = createAdminClient();
  const { error } = await admin.from("payment_methods").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
