import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";

export const runtime = "nodejs";

const PER_PAGE = 20;
const STATUSES = ["Preparing", "Out for delivery", "Delivered", "Cancelled", "Refunded"];

function sanitizeQuery(q: string): string {
  return q
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/_/g, "\\_")
    .replace(/,/g, " ")
    .replace(/[()]/g, "");
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim() ?? "";
    const status = url.searchParams.get("status") ?? "";
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);

    const db = await adminDb();

    const [countsRes, ...statusCounts] = await Promise.all([
      db.from("orders").select("*", { count: "exact", head: true }),
      ...STATUSES.map((s) => db.from("orders").select("*", { count: "exact", head: true }).eq("status", s)),
    ]);

    let query = db.from("orders").select("*", { count: "exact" });
    if (status && status !== "All") query = query.eq("status", status);
    if (q) {
      const like = `%${sanitizeQuery(q)}%`;
      query = query.or(`id.ilike.${like},tracking_number.ilike.${like},address->>name.ilike.${like}`);
    }
    query = query.order("created_at", { ascending: false }).range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const counts: Record<string, number> = { All: countsRes.count ?? 0 };
    STATUSES.forEach((s, i) => (counts[s] = statusCounts[i].count ?? 0));

    return NextResponse.json({ orders: data ?? [], total: count ?? 0, counts });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
