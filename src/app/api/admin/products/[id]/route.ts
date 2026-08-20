import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await adminDb();

    const [productRes, optionsRes, relatedRes] = await Promise.all([
      db.from("products").select("*").eq("id", id).maybeSingle(),
      db.from("product_options").select("id, weight, price, compare_at, stock").eq("product_id", id).order("position"),
      db.from("related_products").select("related_id").eq("product_id", id),
    ]);
    if (productRes.error) return NextResponse.json({ error: productRes.error.message }, { status: 500 });
    if (optionsRes.error) return NextResponse.json({ error: optionsRes.error.message }, { status: 500 });
    if (relatedRes.error) return NextResponse.json({ error: relatedRes.error.message }, { status: 500 });
    if (!productRes.data) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      product: productRes.data,
      options: optionsRes.data ?? [],
      related_ids: (relatedRes.data ?? []).map((r) => r.related_id),
    });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await adminDb();
    const body = await req.json();

    const data = {
      name: body.name,
      category_id: body.category_id,
      subcategory_id: body.subcategory_id || null,
      weight: body.weight,
      price: body.price,
      compare_at: body.compare_at,
      emoji: body.emoji,
      bg_color: body.bg_color,
      badge: body.badge,
      description: body.description,
      description_long: body.description_long,
      origin: body.origin,
      stock: body.stock,
      image_url: body.image_url,
      is_active: body.is_active,
      is_featured: body.is_featured,
      featured_position: body.featured_position,
      low_stock_threshold: body.low_stock_threshold,
      slug: body.slug || slugify(body.name),
    };

    const { error } = await db.from("products").update(data).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (Array.isArray(body.options)) {
      const options = body.options as { weight: string; price: number; compare_at: number | null; stock: number; position: number }[];
      const { error: delErr } = await db.from("product_options").delete().eq("product_id", id);
      if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

      if (options.length > 0) {
        const { error: insErr } = await db.from("product_options").insert(
          options.map((o) => ({
            product_id: id,
            weight: o.weight,
            price: o.price,
            compare_at: o.compare_at,
            stock: o.stock,
            position: o.position,
          }))
        );
        if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
      }
    }

    if (Array.isArray(body.related_ids)) {
      const { error: delRelErr } = await db.from("related_products").delete().eq("product_id", id);
      if (delRelErr) return NextResponse.json({ error: delRelErr.message }, { status: 500 });

      const relatedIds = (body.related_ids as string[]).filter((rid) => rid !== id);
      if (relatedIds.length > 0) {
        const { error: insRelErr } = await db.from("related_products").insert(
          relatedIds.map((related_id) => ({ product_id: id, related_id }))
        );
        if (insRelErr) return NextResponse.json({ error: insRelErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = await adminDb();
    const { error } = await db.from("products").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
