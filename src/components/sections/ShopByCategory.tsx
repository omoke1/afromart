"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

type Category = {
  name: string;
  examples: string;
  emoji: string;
  bg: string;
  slug: string;
};

const categories: Category[] = [
  { name: "Tubers & Grains", examples: "Yam, Rice, Beans, e.t.c.", emoji: "🍠", bg: "#EAF6E4", slug: "tubers-grains" },
  { name: "Protein", examples: "Fish, Meat, Shrimps, e.t.c.", emoji: "🐟", bg: "#E4F3F7", slug: "protein" },
  { name: "Food Bundles", examples: "Stew Bundle, e.t.c.", emoji: "🧺", bg: "#E6EEFB", slug: "bundles" },
  { name: "Cooking Essentials", examples: "Salt, Palm Oil, Curry…", emoji: "🫙", bg: "#FBF4D9", slug: "cooking-essentials" },
  { name: "Organic Foods", examples: "Honey, Cloves, e.t.c.", emoji: "🍯", bg: "#F4ECFB", slug: "organic" },
  { name: "Household", examples: "Toilet Rolls, Detergents…", emoji: "🧻", bg: "#FBE7DC", slug: "household" },
  { name: "Spices & Seasonings", examples: "Suya, Curry, Maggi…", emoji: "🌶️", bg: "#FBE4E4", slug: "spices" },
  { name: "Snacks & Drinks", examples: "Chin Chin, Malt, e.t.c.", emoji: "🥤", bg: "#E4F7EC", slug: "snacks" },
];

export default function ShopByCategory() {
  const scroller = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scroller.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  };

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 lg:mt-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl lg:text-3xl font-bold text-dark tracking-tight">
          Shop by Category
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll left"
            className="w-9 h-9 rounded-full border border-line text-dark hover:bg-surface flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll right"
            className="w-9 h-9 rounded-full border border-line text-dark hover:bg-surface flex items-center justify-center transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable row */}
      <div
        ref={scroller}
        className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/shop?category=${cat.slug}`}
            className="group shrink-0 w-[260px] rounded-2xl p-4 flex items-center gap-4 transition-transform hover:-translate-y-1"
            style={{ backgroundColor: cat.bg }}
          >
            <div className="w-14 h-14 rounded-xl bg-white/70 flex items-center justify-center text-3xl shrink-0">
              {cat.emoji}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-dark leading-tight">{cat.name}</p>
              <p className="text-xs text-ink-soft mt-1 truncate">{cat.examples}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
