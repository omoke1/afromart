"use client";

import Link from "next/link";
import { Minus, Plus, Heart } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";

type ProductCardProduct = {
  id: string;
  name: string;
  category: string;
  price: number;
  compare_at: number | null;
  emoji: string;
  bg_color: string;
  badge: string | null;
  weight: string;
};

export default function ProductCard({ product }: { product: ProductCardProduct }) {
  const { lines, add, setQty } = useCart();
  const { has, toggle } = useWishlist();
  const line = lines.find((l) => l.productId === product.id);
  const qty = line?.qty ?? 0;
  const wished = has(product.id);

  return (
    <div className="group flex flex-col">
      <Link href={`/shop/${product.id}`} className="relative block">
        {product.badge && <Badge kind={product.badge as "promo" | "best-seller" | "new"} />}
        <button
          onClick={(e) => {
            e.preventDefault();
            toggle(product.id);
          }}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart
            className={"w-4 h-4 transition-colors " + (wished ? "fill-brand text-brand" : "text-dark")}
          />
        </button>
        <div
          className="aspect-square rounded-2xl flex items-center justify-center text-7xl overflow-hidden"
          style={{ backgroundColor: product.bg_color }}
        >
          <span className="transition-transform duration-500 ease-out group-hover:scale-110">
            {product.emoji}
          </span>
        </div>
      </Link>

      <div className="pt-4 px-1 flex flex-col">
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted mb-1.5">
          {product.category}
        </p>
        <Link
          href={`/shop/${product.id}`}
          className="text-[15px] font-medium text-dark leading-snug hover:text-brand transition-colors line-clamp-2 min-h-[44px]"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-semibold text-dark">£{product.price.toFixed(2)}</span>
          {product.compare_at && (
            <span className="text-sm text-ink-muted line-through">£{product.compare_at.toFixed(2)}</span>
          )}
          <span className="text-xs text-ink-muted ml-auto">{product.weight}</span>
        </div>

        <div className="mt-4">
          {qty === 0 ? (
            <button
              onClick={() => add(product.id, 1)}
              aria-label={`Add ${product.name} to cart`}
              className="w-full border border-line text-dark text-sm font-medium rounded-full py-2.5 hover:bg-dark hover:text-white hover:border-dark transition-colors"
            >
              Add to cart
            </button>
          ) : (
            <div className="w-full border border-line rounded-full py-1 px-1.5 flex items-center justify-between">
              <button
                onClick={() => setQty(product.id, qty - 1)}
                aria-label="Decrease quantity"
                className="w-8 h-8 rounded-full bg-surface text-dark flex items-center justify-center hover:bg-brand hover:text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-dark">{qty}</span>
              <button
                onClick={() => setQty(product.id, qty + 1)}
                aria-label="Increase quantity"
                className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center hover:bg-brand-hover transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Badge({ kind }: { kind: "promo" | "best-seller" | "new" }) {
  const styles: Record<string, string> = {
    promo: "bg-brand text-white",
    "best-seller": "bg-dark text-white",
    new: "bg-gold text-dark",
  };
  const labels: Record<string, string> = {
    promo: "Promo",
    "best-seller": "Best seller",
    new: "New",
  };
  return (
    <span
      className={
        "absolute top-3 left-3 z-10 text-[10px] tracking-[0.1em] uppercase font-semibold px-2.5 py-1 rounded-full " +
        styles[kind]
      }
    >
      {labels[kind]}
    </span>
  );
}
