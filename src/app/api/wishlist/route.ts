import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ productIds: [] });

  const admin = createAdminClient();
  const { data } = await admin
    .from("wishlist_items")
    .select("product_id")
    .eq("user_id", user.id);

  return NextResponse.json({
    productIds: (data ?? []).map((d) => d.product_id),
  });
}

// Replaces the signed-in user's wishlist with the given set (used to sync the
// localStorage wishlist to their account).
export async function PUT(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  let body: { productIds?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const ids = Array.isArray(body.productIds)
    ? Array.from(new Set(body.productIds.map((p) => String(p)).filter(Boolean)))
    : [];

  const admin = createAdminClient();
  await admin.from("wishlist_items").delete().eq("user_id", user.id);

  if (ids.length > 0) {
    const { error } = await admin.from("wishlist_items").insert(
      ids.map((product_id) => ({ user_id: user.id, product_id })),
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
