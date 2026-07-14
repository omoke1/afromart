"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { createClient } from "@/lib/supabase/client";

type Product = {
  id: string;
  name: string;
  category_id: string;
  category: string;
  weight: string;
  price: number;
  compare_at: number | null;
  emoji: string;
  bg_color: string;
  badge: string | null;
  description: string;
  origin: string | null;
  stock: number;
  image_url: string;
};

export default function BestSellers() {
  const [active, setActive] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    const supabase = createClient();

    supabase
      .from("categories")
      .select("id, name, slug")
      .order("name")
      .then(({ data }) => setCategories(data ?? []));

    supabase
      .from("products")
      .select("*, categories(name)")
      .eq("is_active", true)
      .order("featured_position")
      .order("name")
      .then(({ data }) => {
        const enriched = (data ?? [])
          .filter((p: Record<string, unknown>) => p.is_featured === true)
          .map((p: Record<string, unknown>) => ({
            id: p.id as string,
            name: p.name as string,
            category_id: p.category_id as string,
            weight: p.weight as string,
            price: Number(p.price),
            compare_at: p.compare_at as number | null,
            emoji: p.emoji as string,
            bg_color: p.bg_color as string,
            badge: p.badge as string | null,
            description: p.description as string,
            origin: p.origin as string | null,
            stock: p.stock as number,
            image_url: (p.image_url as string) ?? "",
            category: ((p.categories as { name?: string } | null)?.name ?? "") as string,
          }));
        setProducts(enriched);
      });
  }, []);

  const catSlugMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.id, c.slug);
    return m;
  }, [categories]);

  const visible = useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => catSlugMap.get(p.category_id) === active);
  }, [active, products, catSlugMap]);

  if (products.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-14 lg:mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Hand-picked for you</p>
          <h2 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">Featured products</h2>
        </div>
        <Link href="/shop" className="text-sm font-medium text-dark hover:text-brand transition-colors shrink-0">
          View all →
        </Link>
      </div>

      {categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActive("all")}
            className={
              "px-4 py-2 rounded-full text-sm font-medium border transition-colors " +
              (active === "all"
                ? "bg-dark text-white border-dark"
                : "bg-white text-ink-soft border-line hover:border-dark hover:text-dark")
            }
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setActive(c.slug)}
              className={
                "px-4 py-2 rounded-full text-sm font-medium border transition-colors " +
                (active === c.slug
                  ? "bg-dark text-white border-dark"
                  : "bg-white text-ink-soft border-line hover:border-dark hover:text-dark")
              }
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-10">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
