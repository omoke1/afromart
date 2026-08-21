"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import ProductCard from "@/components/ui/ProductCard";
import { createClient } from "@/lib/supabase/client";
import { useSiteSettings } from "@/lib/useSiteSettings";

type Product = {
  id: string;
  slug?: string | null;
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
  options?: { id: string; weight: string; price: number; stock: number }[];
};

export default function NewArrivals() {
  const { show_product_categories: showProductCategories } = useSiteSettings();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("products")
      .select("*, categories(name), product_options(id, weight, price, stock)")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        const enriched = (data ?? []).map((p: Record<string, unknown>) => ({
          id: p.id as string,
          slug: p.slug as string | null,
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
          options: ((p.product_options as { id: string; weight: string; price: number; stock: number }[] | null) ?? [])
            .map((o) => ({ id: o.id, weight: o.weight, price: Number(o.price), stock: o.stock }))
            .sort((a, b) => a.price - b.price),
        }));
        setProducts(enriched);
      });
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-14 lg:mt-20">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Just landed</p>
          <h2 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">New arrivals</h2>
        </div>
        <Link href="/shop" className="text-sm font-medium text-dark hover:text-brand transition-colors shrink-0">
          View all →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
        {products.map((p) => (
          <ProductCard key={p.id} product={{ ...p, showCategory: showProductCategories }} />
        ))}
      </div>
    </section>
  );
}
