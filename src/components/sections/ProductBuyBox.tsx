"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { useCart } from "@/lib/cart";

type BuyBoxProduct = {
  id: string;
  price: number;
  stock: number;
};

export default function ProductBuyBox({ product }: { product: BuyBoxProduct }) {
  const { add, lines } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = lines.find((l) => l.productId === product.id)?.qty ?? 0;

  const onAdd = () => {
    add(product.id, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mt-8 flex flex-col sm:flex-row gap-3">
      <div className="flex items-center border border-line rounded-full px-2 h-12 w-fit">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          aria-label="Decrease"
          className="w-8 h-8 rounded-full hover:bg-surface text-dark flex items-center justify-center"
        >
          <Minus className="w-4 h-4" />
        </button>
        <span className="w-10 text-center font-semibold text-dark">{qty}</span>
        <button
          onClick={() => setQty((q) => q + 1)}
          aria-label="Increase"
          className="w-8 h-8 rounded-full hover:bg-surface text-dark flex items-center justify-center"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={onAdd}
        disabled={product.stock === 0}
        className="flex-1 h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors disabled:bg-line disabled:text-ink-muted flex items-center justify-center gap-2"
      >
        {added ? (
          <>
            <Check className="w-4 h-4" />
            Added to cart
          </>
        ) : (
          <>Add {qty} to cart · £{(product.price * qty).toFixed(2)}</>
        )}
      </button>

      {inCart > 0 && (
        <Link
          href="/cart"
          className="h-12 px-5 rounded-full border border-line text-dark text-sm font-semibold hover:border-dark flex items-center justify-center"
        >
          View cart ({inCart})
        </Link>
      )}
    </div>
  );
}
