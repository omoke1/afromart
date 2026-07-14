"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, ChevronRight, X, ShoppingCart } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/layout/AccountSidebar";
import { useWishlist } from "@/lib/wishlist";
import { useCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";

type WishlistProduct = {
  id: string;
  name: string;
  emoji: string;
  bg_color: string;
  price: number;
  weight: string;
  category: string;
  category_slug: string;
};

export default function WishlistPage() {
  const { ids, remove, hydrated } = useWishlist();
  const { add } = useCart();
  const [items, setItems] = useState<WishlistProduct[]>([]);

  useEffect(() => {
    if (!hydrated || ids.length === 0) return;

    const supabase = createClient();
    supabase
      .from("products")
      .select("*, categories(name, slug)")
      .in("id", ids)
      .then(({ data }) => {
        if (!data) return;
        setItems(
          data.map((p) => {
            const cat = p.categories as { name: string; slug: string } | null;
            return {
              id: p.id,
              name: p.name,
              emoji: p.emoji,
              bg_color: p.bg_color,
              price: Number(p.price),
              weight: p.weight,
              category: cat?.name ?? "",
              category_slug: cat?.slug ?? "",
            };
          })
        );
      });
  }, [hydrated, ids]);

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />

      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8 flex-wrap">
          <Link href="/" className="hover:text-dark">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/account" className="hover:text-dark">Account</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-dark">Wishlist</span>
        </nav>

        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Saved for later</p>
        <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">
          {hydrated && items.length > 0
            ? `Your wishlist · ${items.length}`
            : "Your wishlist"}
        </h1>

        <div className="mt-10 grid lg:grid-cols-[240px_1fr] gap-10">
          <AccountSidebar />

          <section>
            {hydrated && items.length === 0 ? (
              <div className="border border-line rounded-3xl py-20 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-surface flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-ink-muted" />
                </div>
                <p className="text-dark font-medium">Nothing saved yet.</p>
                <p className="text-ink-muted text-sm mt-2 mb-6">
                  Tap the heart on any product to save it here for later.
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors"
                >
                  Browse the shop
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-line border-y border-line">
                {items.map((product) => (
                  <li key={product.id} className="py-5 flex gap-4 sm:gap-6 items-center">
                    <Link
                      href={`/shop/${product.id}`}
                      className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shrink-0"
                      style={{ backgroundColor: product.bg_color }}
                    >
                      {product.emoji}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted">{product.category}</p>
                      <Link href={`/shop/${product.id}`} className="font-medium text-dark hover:text-brand line-clamp-1">
                        {product.name}
                      </Link>
                      <p className="text-xs text-ink-muted mt-1">{product.weight}</p>
                    </div>
                    <p className="hidden sm:block font-semibold text-dark w-20 text-right">
                      £{product.price.toFixed(2)}
                    </p>
                    <button
                      onClick={() => { add(product.id, 1); remove(product.id); }}
                      className="h-10 px-4 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors flex items-center gap-2"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Add to cart</span>
                    </button>
                    <button
                      onClick={() => remove(product.id)}
                      aria-label="Remove from wishlist"
                      className="w-9 h-9 rounded-full text-ink-muted hover:text-brand flex items-center justify-center"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
