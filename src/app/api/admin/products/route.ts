import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";
import { slugify } from "@/lib/slug";

export const runtime = "nodejs";

const PER_PAGE = 20;

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
    const all = url.searchParams.get("all") === "true";
    const q = url.searchParams.get("q")?.trim() ?? "";
    const category = url.searchParams.get("category") ?? "";
    const badge = url.searchParams.get("badge") ?? "";
    const stock = url.searchParams.get("stock") ?? "all";
    const active = url.searchParams.get("active") ?? "all";
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10) || 1);

    const db = await adminDb();

    const categoriesRes = await db.from("categories").select("id, name").order("name");
    if (categoriesRes.error) return NextResponse.json({ error: categoriesRes.error.message }, { status: 500 });

    if (all) {
      const { data, error } = await db
        .from("products")
        .select("id, name, emoji, image_url, is_active")
        .order("name");
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ products: data ?? [], categories: categoriesRes.data ?? [], total: data?.length ?? 0 });
    }

    let query = db
      .from("products")
      .select("id, name, emoji, image_url, category_id, price, stock, badge, is_active, is_featured", {
        count: "exact",
      });
    if (q) query = query.ilike("name", `%${sanitizeQuery(q)}%`);
    if (category) query = query.eq("category_id", category);
    if (badge) query = query.eq("badge", badge);
    if (stock === "low") query = query.lte("stock", 10);
    if (stock === "out") query = query.eq("stock", 0);
    if (active === "active") query = query.eq("is_active", true);
    if (active === "inactive") query = query.eq("is_active", false);
    query = query.order("name").range((page - 1) * PER_PAGE, page * PER_PAGE - 1);

    const { data, error, count } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      products: data ?? [],
      categories: categoriesRes.data ?? [],
      total: count ?? 0,
    });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await adminDb();
    const body = await req.json();

    const data = {
      name: body.name,
      category_id: body.category_id,
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
      slug: body.slug || slugify(body.name),
    };

    const { data: inserted, error } = await db.from("products").insert(data).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const options = Array.isArray(body.options) ? body.options : [];
    if (options.length > 0) {
      const { error: optErr } = await db.from("product_options").insert(
        options.map((o: { weight: string; price: number; compare_at: number | null; stock: number; position: number }) => ({
          product_id: inserted.id,
          weight: o.weight,
          price: o.price,
          compare_at: o.compare_at,
          stock: o.stock,
          position: o.position,
        }))
      );
      if (optErr) return NextResponse.json({ error: optErr.message }, { status: 500 });
    }

    if (Array.isArray(body.related_ids) && body.related_ids.length > 0) {
      const { error: relErr } = await db.from("related_products").insert(
        body.related_ids
          .filter((rid: unknown) => typeof rid === "string" && rid !== inserted.id)
          .map((rid: string) => ({ product_id: inserted.id, related_id: rid }))
      );
      if (relErr) return NextResponse.json({ error: relErr.message }, { status: 500 });
    }

    return NextResponse.json({ id: inserted.id }, { status: 201 });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
