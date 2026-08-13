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

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (body.is_default === true) {
    const { error: clearErr } = await admin
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id)
      .neq("id", id);
    if (clearErr) return NextResponse.json({ error: clearErr.message }, { status: 500 });
    body = { ...body, is_default: true };
  }

  const { error } = await admin.from("addresses").update(body as never).eq("id", id).eq("user_id", user.id);
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
  const { error } = await admin.from("addresses").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
