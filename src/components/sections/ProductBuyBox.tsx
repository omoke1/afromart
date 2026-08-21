"use client";

import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Check } from "lucide-react";
import { useCart } from "@/lib/cart";
import AnimatedDropdown from "@/components/ui/animated-dropdown";
import { usePreferredCurrency } from '@/lib/usePreferredCurrency';
import { useExchangeRates } from '@/lib/useExchangeRates';
import formatCurrency from '@/lib/currency';

export type ProductOption = {
  id: string;
  weight: string;
  price: number;
  compare_at: number | null;
  stock: number | null;
};

type BuyBoxProduct = {
  id: string;
  price: number;
  stock: number | null;
  weight: string;
  compare_at?: number | null;
  image_url?: string;
  showStockStatus?: boolean;
  options?: ProductOption[];
};

export default function ProductBuyBox({ product }: { product: BuyBoxProduct }) {
  const { add, lines } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const options = product.options ?? [];
  const displayOptions =
    options.length > 0
      ? options
      : [
          {
            id: "",
            weight: product.weight,
            price: product.price,
            compare_at: product.compare_at ?? null,
            stock: product.stock,
          },
        ];

  const [selectedId, setSelectedId] = useState<string>(displayOptions[0].id);
  const option = displayOptions.find((o) => o.id === selectedId) ?? displayOptions[0];

  const unitPrice = option.price;
  const unitStock = option.stock;
  const compareAt = option.compare_at;
  const weightLabel = option.weight;

  const { currency: preferred } = usePreferredCurrency('GBP');
  const { convert, base } = useExchangeRates();
  const convertedUnit = preferred && preferred !== base ? convert(unitPrice, preferred) : null;

  const inCart = lines
    .filter((l) => l.productId === product.id)
    .reduce((sum, l) => sum + l.qty, 0);

  const onAdd = () => {
    add(product.id, qty, option.id || null);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div className="mt-6">
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-semibold text-dark">{formatCurrency(unitPrice, base)}{convertedUnit ? ` · ${formatCurrency(convertedUnit, preferred)}` : ''}</span>
        {compareAt && (
          <span className="text-lg text-ink-muted line-through">{formatCurrency(compareAt, base)}</span>
        )}
        <span className="text-sm text-ink-muted ml-2">{weightLabel}</span>
      </div>

      <label className="block mt-5">
        <span className="block text-sm font-medium text-dark mb-2">
          Pick a buy option{displayOptions.length > 1 ? ` (${displayOptions.length} options available)` : ""}
        </span>
        <AnimatedDropdown
          items={displayOptions.map((o) => ({
            value: o.id,
            label: o.weight,
            price: o.price,
            oldPrice: o.compare_at ?? undefined,
            hint: o.stock === 0 ? "Out of stock" : undefined,
            disabled: o.stock === 0,
            imgSrc: product.image_url,
            imgAlt: o.weight,
          }))}
          text={weightLabel}
          className="block w-full"
          dropdownClassName="left-0 right-0 w-full min-w-0"
          buttonClassName="w-full h-14 px-5 border-line rounded-xl bg-white text-ink-soft text-sm justify-between hover:border-brand hover:bg-brand/5"
          onSelect={setSelectedId}
          align="left"
        />
      </label>

      {product.showStockStatus !== false && <p className="mt-4 text-sm">
        {unitStock === 0 ? (
          <span className="text-red font-medium">Out of stock</span>
        ) : unitStock == null ? (
          <span className="text-green font-medium">In stock</span>
        ) : (
          <span className="text-green font-medium">
            In stock · {unitStock} {unitStock === 1 ? "unit" : "units"} left
          </span>
        )}
      </p>}

      <div className="mt-5 flex flex-col sm:flex-row gap-3">
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
            onClick={() => setQty((q) => unitStock == null ? q + 1 : Math.min(unitStock, q + 1))}
            disabled={unitStock != null && qty >= unitStock}
            aria-label="Increase"
            className="w-8 h-8 rounded-full hover:bg-surface text-dark flex items-center justify-center disabled:text-ink-muted disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={onAdd}
          disabled={unitStock === 0}
          className="flex-1 h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors disabled:bg-line disabled:text-ink-muted flex items-center justify-center gap-2"
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              Added to cart
            </>
          ) : (
            <>Add {qty} to cart · {formatCurrency(unitPrice * qty, base)}{(convertedUnit ? ` · ${formatCurrency(convertedUnit * qty, preferred)}` : '')}</>
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
    </div>
  );
}
