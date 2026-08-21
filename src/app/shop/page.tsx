"use client";

import { Suspense, useMemo, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, LayoutGrid, Store, ChevronDown, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

type DisplayProduct = {
  id: string;
  slug: string | null;
  name: string;
  category: string;
  category_slug: string;
  subcategory_slug: string | null;
  price: number;
  compare_at: number | null;
  emoji: string;
  bg_color: string;
  badge: string | null;
  weight: string;
  image_url: string;
  featured_position: number;
  options?: { id: string; weight: string; price: number; stock: number }[];
};

type DisplayCategory = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  bg: string;
  description: string;
  count: number;
};

type DisplaySubcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  emoji: string;
  position: number;
};

function ShopInner() {
  const searchParams = useSearchParams();
  const queryCategory = searchParams.get("category") ?? "all";
  const querySubcategory = searchParams.get("subcategory") ?? "";

  const [active, setActive] = useState<string>(queryCategory);
  const [activeSub, setActiveSub] = useState<string>(querySubcategory);
  const [sort, setSort] = useState<SortKey>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [displayProducts, setDisplayProducts] = useState<DisplayProduct[]>([]);
  const [displayCategories, setDisplayCategories] = useState<DisplayCategory[]>([]);
  const [subcategories, setSubcategories] = useState<DisplaySubcategory[]>([]);
  const filtersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    }
    if (filtersOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [filtersOpen]);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const catRaw = await supabase.from("categories").select("*").order("name");
      const categories = catRaw.data as { id: string; name: string; slug: string; image_url: string | null; bg_color: string; description: string }[] | null;
      const subcatRaw = await supabase.from("subcategories").select("*").order("position");
      const subcatData = (subcatRaw.data ?? []) as { id: string; category_id: string; name: string; slug: string; emoji: string; position: number }[];
      const prodRaw = await supabase.from("products").select("*, categories!inner(name, slug), product_options(id, weight, price, stock)").eq("is_active", true).order("name");
      const products = prodRaw.data as { id: string; slug: string | null; name: string; category_id: string; subcategory_id: string | null; price: number; emoji: string; bg_color: string; badge: string | null; weight: string; compare_at: number | null; image_url: string | null; featured_position: number | null; categories: { name: string; slug: string }; product_options: { id: string; weight: string; price: number; stock: number }[] | null }[] | null;

      if (!categories || !products) return;

      const catMap = new Map(categories.map((c) => [c.id, c]));
      const subMap = new Map(subcatData.map((s) => [s.id, s]));

      setSubcategories(subcatData);

      setDisplayCategories(
        categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          image_url: c.image_url ?? null,
          bg: c.bg_color,
          description: c.description,
          count: products.filter((p) => p.category_id === c.id).length,
        }))
      );

      setDisplayProducts(
        products.map((p) => {
          const cat = catMap.get(p.category_id);
          const sub = p.subcategory_id ? subMap.get(p.subcategory_id) : null;
          return {
            id: p.id,
            slug: p.slug,
            name: p.name,
            category: cat?.name ?? "",
            category_slug: cat?.slug ?? "",
            subcategory_slug: sub?.slug ?? null,
            price: Number(p.price),
            compare_at: p.compare_at ? Number(p.compare_at) : null,
            emoji: p.emoji,
            bg_color: p.bg_color,
            badge: p.badge,
            weight: p.weight,
            image_url: p.image_url ?? "",
            featured_position: p.featured_position ?? 0,
            options: (p.product_options ?? [])
              .map((o) => ({ id: o.id, weight: o.weight, price: Number(o.price), stock: o.stock }))
              .sort((a, b) => a.price - b.price),
          };
        })
      );
    }
    load();
  }, []);

  const activeCategorySubs = useMemo(
    () => (active === "all" ? [] : subcategories.filter((s) => {
      const cat = displayCategories.find((c) => c.slug === active);
      return cat && s.category_id === cat.id;
    })),
    [active, subcategories, displayCategories]
  );

  const visible = useMemo(() => {
    let filtered =
      active === "all"
        ? displayProducts
        : displayProducts.filter((p) => p.category_slug === active);
    if (activeSub) {
      filtered = filtered.filter((p) => p.subcategory_slug === activeSub);
    }
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
  }, [active, activeSub, sort, displayProducts]);

  const activeCategoryLabel = active === "all" ? "All Categories" : displayCategories.find((c) => c.slug === active)?.name ?? "All Categories";
  const hasActiveFilter = active !== "all" || activeSub !== "";

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
        {/* Row 1: heading + controls */}
        <div className="flex items-center justify-between border-b border-line pb-4 mb-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-sm font-medium text-ink transition-colors select-none">
              <LayoutGrid className="w-4 h-4 text-ink-soft" />
              <span>Categories</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-gold transition-colors select-none">
              <Store className="w-4 h-4" />
              <span>Products</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div ref={filtersRef} className="relative">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                className="flex items-center gap-2 border border-line rounded-full px-4 py-2 text-sm font-medium text-dark bg-white hover:bg-surface cursor-pointer"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilter && (
                  <span className="w-2 h-2 rounded-full bg-gold" />
                )}
              </button>

              {filtersOpen && (
                <div className="absolute top-[calc(100%+0.5rem)] right-0 z-50 w-72 bg-white rounded-2xl shadow-lg border border-line p-4 max-h-[70vh] overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] tracking-[0.18em] uppercase text-ink-muted font-medium">Categories</p>
                    {hasActiveFilter && (
                      <button
                        onClick={() => { setActive("all"); setActiveSub(""); }}
                        className="text-[11px] text-gold font-medium hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                  </div>
                  <ul className="space-y-0.5">
                    <FilterItem label="All" slug="all" active={active} onClick={(s) => { setActive(s); setActiveSub(""); }} count={displayProducts.length} />
                    {displayCategories.map((c) => (
                      <FilterItem
                        key={c.slug}
                        label={c.name}
                        slug={c.slug}
                        active={active}
                        onClick={(s) => { setActive(s); setActiveSub(""); }}
                        count={c.count}
                      />
                    ))}
                  </ul>
                  {activeCategorySubs.length > 0 && (
                    <>
                      <div className="border-t border-line my-3" />
                      <p className="text-[11px] tracking-[0.18em] uppercase text-ink-muted mb-2 font-medium">Subcategories</p>
                      <ul className="space-y-0.5">
                        <FilterItem label={`All ${displayCategories.find((c) => c.slug === active)?.name ?? ""}`} slug="" active={activeSub} onClick={setActiveSub} count={displayProducts.filter((p) => p.category_slug === active).length} />
                        {activeCategorySubs.map((s) => {
                          const count = displayProducts.filter((p) => p.category_slug === active && p.subcategory_slug === s.slug).length;
                          return (
                            <FilterItem key={s.slug} label={s.name} slug={s.slug} active={activeSub} onClick={setActiveSub} count={count} />
                          );
                        })}
                      </ul>
                    </>
                  )}
                </div>
              )}
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="border border-line rounded-full px-4 py-2 text-sm font-medium text-dark bg-white hover:bg-surface cursor-pointer focus:outline-none"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="name">Name: A → Z</option>
            </select>
          </div>
        </div>

        {/* Row 2: Horizontal Scrollable Category Bar */}
        <div className="border-b border-line pb-3 mb-8">
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap py-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => { setActive("all"); setActiveSub(""); }}
              className={`text-sm font-medium transition-all relative pb-2 cursor-pointer ${
                active === "all"
                  ? "text-gold font-semibold"
                  : "text-ink-soft hover:text-dark"
              }`}
            >
              All Categories
              {active === "all" && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gold rounded-full" />
              )}
            </button>
            {displayCategories.map((c) => {
              const isActive = active === c.slug;
              return (
                <button
                  key={c.slug}
                  onClick={() => { setActive(c.slug); setActiveSub(""); }}
                  className={`text-sm font-medium transition-all relative pb-2 cursor-pointer ${
                    isActive
                      ? "text-gold font-semibold"
                      : "text-ink-soft hover:text-dark"
                  }`}
                >
                  {c.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-gold rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active filter pills */}
        {hasActiveFilter && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {active !== "all" && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark text-white text-xs font-medium">
                {activeCategoryLabel}
                <button onClick={() => { setActive("all"); setActiveSub(""); }} className="hover:text-gold transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {activeSub && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark text-white text-xs font-medium">
                {activeCategorySubs.find((s) => s.slug === activeSub)?.name ?? activeSub}
                <button onClick={() => setActiveSub("")} className="hover:text-gold transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Products */}
        {visible.length === 0 ? (
          <div className="border border-line rounded-2xl py-20 text-center">
            <p className="text-dark font-medium">No products in this category yet.</p>
            <p className="text-ink-muted text-sm mt-2">We&apos;re working on stocking it — check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

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
