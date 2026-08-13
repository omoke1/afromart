import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

type Currency = {
  code: string;
  name: string;
  symbol: string;
  rate_to_base: number;
  auto_update?: boolean;
};

export async function GET() {
  const db = createAdminClient();
  const { data, error } = await db.from("currencies").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  try {
    const db = await adminDb();
    const body: Currency = await req.json();
    const { data, error } = await db.from("currencies").insert(body as never);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const db = await adminDb();
    const body: Currency = await req.json();
    if (!body.code) return NextResponse.json({ error: "Missing code" }, { status: 400 });
    const updatePayload: Record<string, unknown> = {
      name: body.name,
      symbol: body.symbol,
      rate_to_base: body.rate_to_base,
      auto_update: body.auto_update ?? false,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await db.from("currencies").update(updatePayload as never).eq("code", body.code);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const db = await adminDb();
    const { code } = await req.json();
    if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

    const { error } = await db.from("currencies").delete().eq("code", code);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
