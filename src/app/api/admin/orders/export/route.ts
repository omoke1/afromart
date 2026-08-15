import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";

export const runtime = "nodejs";

const STATUSES = ["Preparing", "Out for delivery", "Delivered", "Cancelled", "Refunded", "Ready for pickup"];

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

    const db = await adminDb();

    let query = db.from("orders").select("id, created_at, status, total, courier, tracking_number, address");
    if (status && status !== "All" && STATUSES.includes(status)) query = query.eq("status", status);
    if (q) {
      const like = `%${sanitizeQuery(q)}%`;
      query = query.or(`id.ilike.${like},tracking_number.ilike.${like},address->>name.ilike.${like}`);
    }
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = (data ?? []).map((o) => {
      const address = (o.address ?? {}) as Record<string, unknown>;
      return [
        o.id,
        new Date(o.created_at).toISOString().slice(0, 10),
        String(address.name ?? ""),
        String(address.city ?? ""),
        o.status,
        o.courier ?? "",
        o.tracking_number ?? "",
        Number(o.total).toFixed(2),
      ];
    });

    const header = ["Order ID", "Date", "Customer", "City", "Status", "Courier", "Tracking", "Total"];
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="afromart-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
