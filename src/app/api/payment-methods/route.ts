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
    .from("payment_methods")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ cards: data ?? [] });
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

  const brand = String(body.brand ?? "");
  const last4 = String(body.last4 ?? "");
  const expiry = String(body.expiry ?? "");
  if (!["Visa", "Mastercard", "Amex"].includes(brand) || !/^\d{4}$/.test(last4) || !expiry) {
    return NextResponse.json({ error: "Invalid card details" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("payment_methods")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  const isFirst = !existing;

  const { data, error } = await admin
    .from("payment_methods")
    .insert({
      user_id: user.id,
      brand: brand as "Visa" | "Mastercard" | "Amex",
      last4,
      expiry,
      is_default: isFirst,
    })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ card: data });
}
