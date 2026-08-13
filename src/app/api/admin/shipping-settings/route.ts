import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

const DEFAULT_SETTINGS = {
  id: "default",
  base_fee: 4.99,
  per_kg_fee: 1.25,
  free_delivery_threshold: 40,
  enabled: true,
};

function normalizeSettings(data: any) {
  return {
    id: data?.id ?? DEFAULT_SETTINGS.id,
    base_fee: Number(data?.base_fee ?? DEFAULT_SETTINGS.base_fee),
    per_kg_fee: Number(data?.per_kg_fee ?? DEFAULT_SETTINGS.per_kg_fee),
    free_delivery_threshold: Number(data?.free_delivery_threshold ?? DEFAULT_SETTINGS.free_delivery_threshold),
    enabled: data?.enabled ?? DEFAULT_SETTINGS.enabled,
    updated_at: data?.updated_at ?? new Date().toISOString(),
  };
}

export async function GET() {
  const db = createAdminClient();
  const { data, error } = await db
    .from("shipping_settings")
    .select("*")
    .eq("id", "default")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: normalizeSettings(data) });
}

export async function PUT(req: Request) {
  try {
    const db = await adminDb();
    const body = await req.json();
    const existing = normalizeSettings(body);

    const { data, error } = await db
      .from("shipping_settings")
      .upsert(
        {
          id: "default",
          base_fee: existing.base_fee,
          per_kg_fee: existing.per_kg_fee,
          free_delivery_threshold: existing.free_delivery_threshold,
          enabled: existing.enabled,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )
      .select()
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data: normalizeSettings(data) });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
