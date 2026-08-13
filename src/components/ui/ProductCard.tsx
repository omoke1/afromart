"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Heart } from "lucide-react";
import { useCart, lineKey } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import AnimatedDropdown from "@/components/ui/animated-dropdown";
import { usePreferredCurrency } from '@/lib/usePreferredCurrency';
import { useExchangeRates } from '@/lib/useExchangeRates';
import formatCurrency from '@/lib/currency';

type CardOption = {
  id: string;
  weight: string;
  price: number;
  stock: number;
};

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
  image_url?: string;
  stock?: number;
  options?: CardOption[];
};

function firstLineKey(lines: { productId: string; optionId: string | null }[]): string {
  const first = lines[0];
  return first ? lineKey(first.productId, first.optionId) : "";
}

export default function ProductCard({ product }: { product: ProductCardProduct }) {
  const { lines, setLineQty, add, openProductDrawer } = useCart();
  const { has, toggle } = useWishlist();
  const productLines = lines.filter((l) => l.productId === product.id);
  const qty = productLines.reduce((sum, l) => sum + l.qty, 0);
  const wished = has(product.id);

  const options = product.options ?? [];
  const displayOptions =
    options.length > 0
      ? options
      : [{ id: "", weight: product.weight, price: product.price, stock: product.stock ?? 1 }];
  const hasVariants = options.length > 1;
  const minPrice = Math.min(...displayOptions.map((o) => o.price));
  const { currency: preferred } = usePreferredCurrency('GBP');
  const { convert, base } = useExchangeRates();
  const convertedMin = preferred && preferred !== base ? convert(minPrice, preferred) : null;

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
          className="aspect-square rounded-2xl flex items-center justify-center text-7xl overflow-hidden relative"
          style={{ backgroundColor: product.bg_color }}
        >
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-contain p-3 transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <span className="transition-transform duration-500 ease-out group-hover:scale-110">
              {product.emoji}
            </span>
          )}

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (openProductDrawer) {
                openProductDrawer({
                  id: product.id,
                  name: product.name,
                  img: product.image_url ?? null,
                  options: displayOptions.map((o) => ({ id: o.id, label: o.weight, price: o.price, oldPrice: product.compare_at ?? undefined })),
                });
              } else {
                add(product.id, 1, null);
              }
            }}
            aria-label="Open product options"
            className="absolute bottom-3 right-3 z-10 w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center shadow-sm"
          >
            <span className="text-2xl leading-none">+</span>
          </button>
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
          <span className="text-base font-semibold text-dark">
            {hasVariants ? (
              <>from {formatCurrency(minPrice, base)}{convertedMin ? ` · ${formatCurrency(convertedMin, preferred)}` : ''}</>
            ) : (
              <>{formatCurrency(minPrice, base)}{convertedMin ? ` · ${formatCurrency(convertedMin, preferred)}` : ''}</>
            )}
          </span>
          {product.compare_at && (
            <span className="text-sm text-ink-muted line-through">£{product.compare_at.toFixed(2)}</span>
          )}
          <span className="text-xs text-ink-muted ml-auto">
            {hasVariants ? `${options.length} sizes` : product.weight}
          </span>
        </div>

        <div className="mt-4">
          {qty === 0 ? (
            <QuickAdd product={product} displayOptions={displayOptions} />
          ) : (
            <div className="w-full border border-line rounded-full py-1 px-1.5 flex items-center justify-between">
              <button
                onClick={() => setLineQty(firstLineKey(productLines), qty - 1)}
                aria-label="Decrease quantity"
                className="w-8 h-8 rounded-full bg-surface text-dark flex items-center justify-center hover:bg-brand hover:text-white transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-dark">{qty}</span>
              <button
                onClick={() => setLineQty(firstLineKey(productLines), qty + 1)}
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

function QuickAdd({
  product,
  displayOptions,
}: {
  product: ProductCardProduct;
  displayOptions: CardOption[];
}) {
  const { add, openDrawer } = useCart();
  const { currency: preferred } = usePreferredCurrency('GBP');
  const { convert, base } = useExchangeRates();

  return (
        <AnimatedDropdown
      items={displayOptions.map((o) => ({
        value: o.id,
        label: o.weight,
        price: o.price,
        oldPrice: product.compare_at ?? undefined,
        hint: o.stock === 0 ? "Out of stock" : (() => {
          if (!preferred || preferred === base) return `${formatCurrency(o.price, base)}`;
          const conv = convert(o.price, preferred);
          return conv !== null ? `${formatCurrency(conv, preferred)}` : `${formatCurrency(o.price, base)}`;
        })(),
        imgSrc: product.image_url,
        disabled: o.stock === 0,
      }))}
      text={`Options: ${displayOptions.length}`}
      className=""
      align="left"
      buttonClassName="inline-flex items-center gap-2 rounded px-2 py-1 text-sm bg-white text-dark border border-line"
      onSelect={(value) => add(product.id, 1, value || null)}
      onAction={(value) => {
        add(product.id, 1, value || null);
        // open the cart drawer so the user sees the line added
        openDrawer();
      }}
    />
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
