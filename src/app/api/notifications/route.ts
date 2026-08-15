import { NextResponse } from "next/server";
import { NotSignedInError, requireUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof NotSignedInError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    throw err;
  }

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 100);

  const admin = createAdminClient();
  const [{ data: notifications }, { count: unread }] = await Promise.all([
    admin
      .from("notifications")
      .select("*")
      .eq("scope", "user")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit),
    admin
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("scope", "user")
      .eq("user_id", user.id)
      .eq("is_read", false),
  ]);

  return NextResponse.json({ notifications: notifications ?? [], unread: unread ?? 0 });
}

export async function PATCH(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof NotSignedInError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    throw err;
  }

  let ids: string[] = [];
  try {
    const body = await req.json();
    ids = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === "string") : [];
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const admin = createAdminClient();
  let query = admin
    .from("notifications")
    .update({ is_read: true })
    .eq("scope", "user")
    .eq("user_id", user.id);
  if (ids.length > 0) query = query.in("id", ids);

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
