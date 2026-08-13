import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const admin = await requireAdmin();
    const db = await adminDb();

    const { data: row } = await db.from("admin_roles").select("user_id").eq("id", id).maybeSingle();
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (row.user_id === admin.id) {
      return NextResponse.json({ error: "You can't remove yourself." }, { status: 400 });
    }

    const { count } = await db.from("admin_roles").select("*", { count: "exact", head: true });
    if ((count ?? 0) <= 1) {
      return NextResponse.json({ error: "You can't remove the last admin." }, { status: 400 });
    }

    const { error } = await db.from("admin_roles").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
