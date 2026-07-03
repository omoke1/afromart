"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import { createClient } from "@/lib/supabase/client";

type SearchProduct = {
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
  description: string;
  origin: string | null;
};

type SearchCategory = {
  name: string;
  slug: string;
};

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const q = (params.get("q") ?? "").trim();
  const [draft, setDraft] = useState(q);
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [categories, setCategories] = useState<SearchCategory[]>([]);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const catRaw = await supabase.from("categories").select("name, slug").order("name");
      if (catRaw.data) setCategories(catRaw.data as SearchCategory[]);

      const prodRaw = await supabase.from("products").select("*, categories(name, slug)").order("name");
      const prodData = prodRaw.data as { id: string; name: string; price: number; compare_at: number | null; emoji: string; bg_color: string; badge: string | null; weight: string; description: string; origin: string | null; categories: { name: string; slug: string } | null }[] | null;
      if (!prodData) return;

      setProducts(
        prodData.map((p) => {
          const cat = p.categories as { name: string; slug: string } | null;
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
            description: p.description,
            origin: p.origin,
          };
        })
      );
    }
    load();
  }, []);

  const results = useMemo(() => {
    if (!q) return [];
    const needle = q.toLowerCase();
    return products.filter((p) =>
      [p.name, p.category, p.description, p.origin ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(needle)
    );
  }, [q, products]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(draft)}`);
  };

  const suggestions = q
    ? []
    : products
        .filter((p) => p.badge === "best-seller")
        .slice(0, 4);

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Search</p>
        <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">
          {q ? <>Results for &ldquo;{q}&rdquo;</> : "What are you looking for?"}
        </h1>

        <form onSubmit={onSubmit} className="mt-6 flex max-w-xl border border-line rounded-full bg-white pl-5 pr-1 h-12 items-center">
          <Search className="w-4 h-4 text-ink-muted" />
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Try ‘egusi’, ‘palm oil’, ‘jollof’…"
            className="flex-1 ml-3 bg-transparent text-sm text-dark focus:outline-none placeholder:text-ink-muted"
            autoFocus
          />
          <button
            type="submit"
            className="h-10 px-5 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors"
          >
            Search
          </button>
        </form>

        {q ? (
          results.length === 0 ? (
            <div className="mt-12 border border-line rounded-3xl py-20 text-center">
              <p className="text-dark font-medium">No products match &ldquo;{q}&rdquo;.</p>
              <p className="text-ink-muted text-sm mt-2 mb-6">
                Try a different spelling or browse a category.
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-xl mx-auto px-6">
                {categories.slice(0, 5).map((c) => (
                  <Link
                    key={c.slug}
                    href={`/shop?category=${c.slug}`}
                    className="px-4 py-2 rounded-full text-sm font-medium border border-line text-dark hover:border-dark"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="mt-6 text-sm text-ink-soft">
                {results.length} {results.length === 1 ? "result" : "results"} found.
              </p>
              <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                {results.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </>
          )
        ) : (
          <>
            <div className="mt-10">
              <p className="text-[11px] tracking-[0.18em] uppercase text-ink-muted mb-4">Popular searches</p>
              <div className="flex flex-wrap gap-2">
                {["jollof", "palm oil", "egusi", "stockfish", "suya", "garri"].map((term) => (
                  <Link
                    key={term}
                    href={`/search?q=${encodeURIComponent(term)}`}
                    className="px-4 py-2 rounded-full text-sm font-medium border border-line text-dark hover:border-dark"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-14">
              <h2 className="text-xl font-semibold text-dark mb-6">Best sellers</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                {suggestions.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
