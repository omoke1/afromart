"use client";

import { useState } from "react";
import { Check, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/lib/cart";

type ShoppableProduct = { id: string; price: number };

export default function RecipeAddAll({
  shoppable,
}: {
  shoppable: { name: string; amount: string; product: ShoppableProduct }[];
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const total = shoppable.reduce((s, i) => s + i.product.price, 0);

  const onAddAll = () => {
    shoppable.forEach((i) => add(i.product.id, 1));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="mt-8 border border-line rounded-2xl p-5 bg-surface">
      <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted mb-1">Shoppable ingredients</p>
      <p className="text-sm text-ink-soft">
        Add {shoppable.length} pantry items to your cart for <strong className="text-dark">£{total.toFixed(2)}</strong>.
      </p>
      <div className="mt-4 flex gap-3">
        <button
          onClick={onAddAll}
          className="flex-1 h-11 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors flex items-center justify-center gap-2"
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              Added to cart
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Add all to cart
            </>
          )}
        </button>
        <Link
          href="/cart"
          className="h-11 px-5 rounded-full border border-line text-dark text-sm font-semibold hover:border-dark flex items-center justify-center"
        >
          View cart
        </Link>
      </div>
    </div>
  );
}
