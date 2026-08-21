import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await adminDb();
    const { data, error } = await db.from("site_settings").select("*").eq("id", "default").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ settings: data });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const db = await adminDb();
    const body = await req.json();
    const { error } = await db.from("site_settings").update({
      show_catalog_nav: body.show_catalog_nav === true,
      show_product_breadcrumbs: body.show_product_breadcrumbs === true,
      show_product_categories: body.show_product_categories === true,
      updated_at: new Date().toISOString(),
    }).eq("id", "default");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
