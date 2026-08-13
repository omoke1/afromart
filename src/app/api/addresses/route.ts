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
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ addresses: data ?? [] });
}

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof NotSignedInError) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    throw err;
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const line1 = String(body.line1 ?? "").trim();
  const city = String(body.city ?? "").trim();
  const postcode = String(body.postcode ?? "").trim();
  if (!name || !line1 || !city || !postcode) {
    return NextResponse.json({ error: "Missing address details" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("addresses")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  const isFirst = !existing;

  const { data, error } = await admin
    .from("addresses")
    .insert({
      user_id: user.id,
      label: String(body.label ?? ""),
      name,
      line1,
      line2: body.line2 ? String(body.line2) : null,
      city,
      postcode,
      country: String(body.country ?? "United Kingdom"),
      is_default: isFirst,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ address: data });
}
