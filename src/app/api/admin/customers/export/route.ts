import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";

export const runtime = "nodejs";

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

    const db = await adminDb();

    let query = db.from("profiles").select("id, name, email, phone, created_at");
    if (q) {
      const like = `%${sanitizeQuery(q)}%`;
      query = query.or(`email.ilike.${like},name.ilike.${like}`);
    }
    query = query.order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const rows = (data ?? []).map((p) => [
      p.id,
      p.name ?? "",
      p.email ?? "",
      p.phone ?? "",
      new Date(p.created_at).toISOString().slice(0, 10),
    ]);

    const header = ["User ID", "Name", "Email", "Phone", "Joined"];
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="afromart-customers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
