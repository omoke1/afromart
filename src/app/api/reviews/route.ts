import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to leave a review." }, { status: 401 });
  }

  let body: { productId?: string; rating?: number; title?: string; body?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const productId = String(body.productId ?? "");
  const rating = Math.round(Number(body.rating));
  const title = String(body.title ?? "").trim().slice(0, 120);
  const reviewBody = String(body.body ?? "").trim().slice(0, 2000);

  if (!productId) return NextResponse.json({ error: "Missing product." }, { status: 400 });
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5 stars." }, { status: 400 });
  }
  if (!title && !reviewBody) {
    return NextResponse.json({ error: "Please add a title or a few words about the product." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: product } = await admin.from("products").select("id").eq("id", productId).maybeSingle();
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });

  const { data: existing } = await admin
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: "You've already reviewed this product." }, { status: 409 });
  }

  const { data, error } = await admin
    .from("reviews")
    .insert({
      product_id: productId,
      user_id: user.id,
      rating,
      title,
      body: reviewBody,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
