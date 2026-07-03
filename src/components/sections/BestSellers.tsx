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
};

const filters = [
  { label: "All", slug: "all" },
  { label: "Tubers & Grains", slug: "grains" },
  { label: "Cooking Essentials", slug: "cooking" },
  { label: "Spices & Seasonings", slug: "spices" },
  { label: "Snacks & Drinks", slug: "snacks" },
];

export default function BestSellers() {
  const [active, setActive] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.from("categories").select("id, slug").then(({ data }) => {
      const map: Record<string, string> = {};
      for (const c of data ?? []) {
        map[c.id] = c.slug;
      }
      setCategories(map);
    });
    supabase.from("products").select("*, categories(name)").order("name").then(({ data }) => {
      const enriched = (data ?? []).map((p: Record<string, unknown>) => ({
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
        category: ((p.categories as { name?: string } | null)?.name ?? "") as string,
      }));
      setProducts(enriched);
    });
  }, []);

  const visible = useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => categories[p.category_id] === active);
  }, [active, products, categories]);

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-14 lg:mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Trending now</p>
          <h2 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">Featured products</h2>
        </div>
        <Link href="/shop" className="text-sm font-medium text-dark hover:text-brand transition-colors shrink-0">
          View all →
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {filters.map((f) => {
          const isActive = active === f.slug;
          return (
            <button
              key={f.slug}
              onClick={() => setActive(f.slug)}
              className={
                "px-4 py-2 rounded-full text-sm font-medium border transition-colors " +
                (isActive
                  ? "bg-dark text-white border-dark"
                  : "bg-white text-ink-soft border-line hover:border-dark hover:text-dark")
              }
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-5 gap-y-10">
        {visible.slice(0, 10).map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
