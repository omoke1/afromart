import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Stores the signed-in user's cart server-side so the abandoned-cart cron can
// reach people who left items behind. Replaces the user's saved cart wholesale.
export async function PUT(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  let body: { lines?: { productId?: string; qty?: number }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const lines = Array.isArray(body.lines)
    ? body.lines
        .filter((l) => l.productId && Number(l.qty) > 0)
        .map((l) => ({ productId: l.productId!, qty: Math.max(0, Math.round(Number(l.qty) || 0)) }))
    : [];

  if (lines.length === 0) {
    return NextResponse.json({ ok: true, cleared: true });
  }

  const ids = Array.from(new Set(lines.map((l) => l.productId)));
  const admin = createAdminClient();

  const { data: products } = await admin.from("products").select("id").in("id", ids);
  const validIds = new Set((products ?? []).map((p) => p.id));

  const clean = lines.filter((l) => validIds.has(l.productId));

  await admin.from("cart_items").delete().eq("user_id", user.id);
  if (clean.length > 0) {
    await admin.from("cart_items").insert(
      clean.map((l) => ({ user_id: user.id, product_id: l.productId, qty: l.qty })),
    );
  }

  return NextResponse.json({ ok: true, cleared: clean.length === 0 });
}
