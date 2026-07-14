"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { createClient } from "@/lib/supabase/client";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

type DisplayProduct = {
  id: string;
  name: string;
  category: string;
  category_slug: string;
  price: number;
  compare_at: number | null;
  emoji: string;
  bg_color: string;
  badge: string | null;
  weight: string;
  image_url: string;
  featured_position: number;
};

type DisplayCategory = {
  name: string;
  slug: string;
  emoji: string;
  bg: string;
  description: string;
  count: number;
};

function ShopInner() {
  const searchParams = useSearchParams();
  const queryCategory = searchParams.get("category") ?? "all";

  const [active, setActive] = useState<string>(queryCategory);
  const [sort, setSort] = useState<SortKey>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [displayProducts, setDisplayProducts] = useState<DisplayProduct[]>([]);
  const [displayCategories, setDisplayCategories] = useState<DisplayCategory[]>([]);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const catRaw = await supabase.from("categories").select("*").order("name");
      const categories = catRaw.data as { id: string; name: string; slug: string; emoji: string; bg_color: string; description: string }[] | null;
      const prodRaw = await supabase.from("products").select("*, categories!inner(name, slug)").eq("is_active", true).order("name");
      const products = prodRaw.data as { id: string; name: string; category_id: string; price: number; emoji: string; bg_color: string; badge: string | null; weight: string; compare_at: number | null; image_url: string | null; featured_position: number | null; categories: { name: string; slug: string } }[] | null;

      if (!categories || !products) return;

      const catMap = new Map(categories.map((c) => [c.id, c]));

      setDisplayCategories(
        categories.map((c) => ({
          name: c.name,
          slug: c.slug,
          emoji: c.emoji,
          bg: c.bg_color,
          description: c.description,
          count: products.filter((p) => p.category_id === c.id).length,
        }))
      );

      setDisplayProducts(
        products.map((p) => {
          const cat = catMap.get(p.category_id);
          return {
            id: p.id,
            name: p.name,
            category: cat?.name ?? "",
            category_slug: cat?.slug ?? "",
            price: Number(p.price),
            compare_at: p.compare_at ? Number(p.compare_at) : null,
            emoji: p.emoji,
            bg_color: p.bg_color,
            badge: p.badge,
            weight: p.weight,
            image_url: p.image_url ?? "",
            featured_position: p.featured_position ?? 0,
          };
        })
      );
    }
    load();
  }, []);

  const visible = useMemo(() => {
    const filtered =
      active === "all"
        ? displayProducts
        : displayProducts.filter((p) => p.category_slug === active);
    const list = [...filtered];
    switch (sort) {
      case "featured":
        list.sort((a, b) => a.featured_position - b.featured_position || a.name.localeCompare(b.name));
        break;
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "name":
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }
    return list;
  }, [active, sort, displayProducts]);

  const activeCategory = displayCategories.find((c) => c.slug === active);

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
        <nav className="text-sm text-ink-muted mb-4">
          <Link href="/" className="hover:text-dark">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-dark">Shop{activeCategory ? ` · ${activeCategory.name}` : ""}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">All products</p>
            <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">
              {activeCategory ? activeCategory.name : "The full shop"}
            </h1>
            {activeCategory && (
              <p className="mt-2 text-ink-soft text-sm max-w-xl">{activeCategory.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 border border-line rounded-full px-4 py-2 text-sm font-medium text-dark"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-line rounded-full px-4 py-2 text-sm font-medium text-dark bg-white"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name: A → Z</option>
            </select>
          </div>
        </div>

        <div className="grid lg:grid-cols-[220px_1fr] gap-10">
          <aside className="hidden lg:block">
            <p className="text-[11px] tracking-[0.18em] uppercase text-ink-muted mb-4">Categories</p>
            <ul className="space-y-1">
              <FilterItem label="All" slug="all" active={active} onClick={setActive} count={displayProducts.length} />
              {displayCategories.map((c) => (
                <FilterItem
                  key={c.slug}
                  label={c.name}
                  slug={c.slug}
                  active={active}
                  onClick={setActive}
                  count={c.count}
                />
              ))}
            </ul>
          </aside>

          <section>
            {visible.length === 0 ? (
              <div className="border border-line rounded-2xl py-20 text-center">
                <p className="text-dark font-medium">No products in this category yet.</p>
                <p className="text-ink-muted text-sm mt-2">We&apos;re working on stocking it — check back soon.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-10">
                {visible.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      {mobileFiltersOpen && (
        <div className="lg:hidden fixed inset-0 z-[80]">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-dark">Filter by category</h2>
              <button onClick={() => setMobileFiltersOpen(false)} className="text-ink-muted text-sm">Close</button>
            </div>
            <ul className="space-y-1">
              <FilterItem label="All" slug="all" active={active} onClick={(s) => { setActive(s); setMobileFiltersOpen(false); }} count={displayProducts.length} />
              {displayCategories.map((c) => (
                <FilterItem
                  key={c.slug}
                  label={c.name}
                  slug={c.slug}
                  active={active}
                  onClick={(s) => { setActive(s); setMobileFiltersOpen(false); }}
                  count={c.count}
                />
              ))}
            </ul>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}

function FilterItem({
  label,
  slug,
  active,
  onClick,
  count,
}: {
  label: string;
  slug: string;
  active: string;
  onClick: (slug: string) => void;
  count: number;
}) {
  const isActive = active === slug;
  return (
    <li>
      <button
        onClick={() => onClick(slug)}
        className={
          "w-full text-left flex items-center justify-between py-2 px-3 rounded-lg text-sm transition-colors " +
          (isActive
            ? "bg-dark text-white font-medium"
            : "text-ink-soft hover:bg-surface hover:text-dark")
        }
      >
        <span>{label}</span>
        <span className={isActive ? "text-white/70 text-xs" : "text-ink-muted text-xs"}>{count}</span>
      </button>
    </li>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopInner />
    </Suspense>
  );
}
