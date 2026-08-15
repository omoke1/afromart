import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "30", 10) || 30, 100);

    const db = await adminDb();

    const [{ data: recent, count: unread }, { count }] = await Promise.all([
      db
        .from("notifications")
        .select("*", { count: "exact" })
        .eq("scope", "admin")
        .eq("is_read", false)
        .order("created_at", { ascending: false })
        .limit(limit),
      db
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("scope", "admin"),
    ]);

    return NextResponse.json({
      notifications: recent ?? [],
      unread: unread ?? 0,
      total: count ?? 0,
    });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const db = await adminDb();
    let ids: string[] = [];
    try {
      const body = await req.json();
      ids = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === "string") : [];
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let query = db.from("notifications").update({ is_read: true }).eq("scope", "admin");
    if (ids.length > 0) query = query.in("id", ids);
    const { error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
