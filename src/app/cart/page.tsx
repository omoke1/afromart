"use client";

import Link from "next/link";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import { useCart, useCartLines } from "@/lib/cart";
import { usePreferredCurrency } from '@/lib/usePreferredCurrency';
import { useExchangeRates } from '@/lib/useExchangeRates';
import formatCurrency from '@/lib/currency';
import { calculateShippingFee, parseWeightKg } from '@/lib/weight';
import { useShippingSettings } from '@/lib/useShippingSettings';
import { productPath } from "@/lib/product-url";

export default function CartPage() {
  const { subtotal, setLineQty, removeLine, hydrated, count } = useCart();
  const lines = useCartLines();

  const totalKg = lines.reduce((sum, line) => {
    const parsedKg = parseWeightKg(line.product.weight);
    return sum + (parsedKg ?? 0) * line.qty;
  }, 0);

  const { settings } = useShippingSettings();
  const delivery = !settings.enabled || subtotal >= settings.free_delivery_threshold || subtotal === 0
    ? 0
    : calculateShippingFee(totalKg, settings);
  const total = subtotal + delivery;
  const remaining = Math.max(0, settings.free_delivery_threshold - subtotal);
  const { currency: preferred } = usePreferredCurrency('GBP');
  const { convert, base } = useExchangeRates();
  const convertedDelivery = preferred && preferred !== base ? convert(delivery, preferred) : null;
  const convertedSubtotal = preferred && preferred !== base ? convert(subtotal, preferred) : null;
  const convertedTotal = preferred && preferred !== base ? convert(total, preferred) : null;
  const convertedRemaining = preferred && preferred !== base ? convert(remaining, preferred) : null;

  if (!hydrated) {
    return (
      <main className="bg-bg min-h-screen flex flex-col">
        <Navbar />
        <CategoryBar />
        <div className="flex-1" />
        <Footer />
      </main>
    );
  }

  // If local storage is hydrated but product details are still loading
  // useCartLines may temporarily return an empty array while product data
  // is being fetched. If the cart count indicates items exist, show a
  // loading skeleton instead of the empty cart message.
  if (hydrated && count > 0 && lines.length === 0) {
    return (
      <main className="bg-bg min-h-screen flex flex-col">
        <Navbar />
        <CategoryBar />
        <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
          <div className="animate-pulse">
            <div className="h-6 bg-surface rounded w-48 mb-4" />
            <div className="h-6 bg-surface rounded w-full mb-6" />
            <div className="space-y-4">
              <div className="h-24 bg-white rounded shadow" />
              <div className="h-24 bg-white rounded shadow" />
              <div className="h-24 bg-white rounded shadow" />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
        <nav className="text-sm text-ink-muted mb-4">
          <Link href="/" className="hover:text-dark">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-dark">Cart</span>
        </nav>

        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Your cart</p>
            <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">
              {lines.length === 0
                ? "Cart is empty"
                : `${lines.length} ${lines.length === 1 ? "item" : "items"}`}
            </h1>
          </div>
          {lines.length > 0 && (
            <Link href="/shop" className="text-sm font-medium text-dark hover:text-brand">
              Continue shopping →
            </Link>
          )}
        </div>

        {lines.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="grid lg:grid-cols-[1fr_380px] gap-10">
            {/* Lines */}
            <ul className="divide-y divide-line border-y border-line">
              {lines.map(({ key, product, qty }) => (
                <li key={key} className="py-6 flex gap-4 sm:gap-6">
                  <Link
                    href={productPath(product)}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl flex items-center justify-center text-5xl shrink-0"
                    style={{ backgroundColor: product.bg }}
                  >
                    {product.emoji}
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted">{product.category}</p>
                    <Link href={productPath(product)} className="font-medium text-dark hover:text-brand line-clamp-2">
                      {product.name}
                    </Link>
                    <p className="text-xs text-ink-muted mt-1">{product.weight}</p>

                    <div className="mt-auto pt-3 flex items-center gap-4 flex-wrap">
                      <div className="flex items-center border border-line rounded-full px-1.5 h-9">
                        <button
                          onClick={() => setLineQty(key, qty - 1)}
                          aria-label="Decrease quantity"
                          className="w-7 h-7 rounded-full hover:bg-surface text-dark flex items-center justify-center"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-semibold text-dark text-sm">{qty}</span>
                        <button
                          onClick={() => setLineQty(key, qty + 1)}
                          aria-label="Increase quantity"
                          className="w-7 h-7 rounded-full hover:bg-surface text-dark flex items-center justify-center"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeLine(key)}
                        className="text-xs text-ink-muted hover:text-brand flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-dark">£{(product.price * qty).toFixed(2)}</p>
                    <p className="text-xs text-ink-muted mt-1">£{product.price.toFixed(2)} each</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Summary */}
            <aside className="lg:sticky lg:top-24 h-fit">
              <div className="border border-line rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-dark mb-4">Order summary</h2>

                  {remaining > 0 ? (
                  <div className="mb-5 p-3 rounded-xl bg-surface text-xs text-ink-soft">
                    Add <strong className="text-dark">{formatCurrency(remaining, base)}{convertedRemaining ? ` · ${formatCurrency(convertedRemaining, preferred)}` : ''}</strong> more for free delivery.
                  </div>
                ) : subtotal > 0 ? (
                  <div className="mb-5 p-3 rounded-xl bg-green/10 text-xs text-dark">
                    🎉 You&apos;ve unlocked <strong>free UK delivery</strong>.
                  </div>
                ) : null}

                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">Subtotal</dt>
                    <dd className="text-dark font-medium">{formatCurrency(subtotal, base)}{convertedSubtotal ? ` · ${formatCurrency(convertedSubtotal, preferred)}` : ''}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">Delivery</dt>
                    <dd className="text-dark font-medium">
                      {delivery === 0 ? "Free" : `${formatCurrency(delivery, base)}${convertedDelivery ? ` · ${formatCurrency(convertedDelivery, preferred)}` : ''}`}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-ink-soft">Shipping weight</dt>
                    <dd className="text-dark font-medium">{totalKg.toFixed(2)} kg</dd>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-line">
                    <dt className="text-dark font-semibold">Total</dt>
                    <dd className="text-dark font-semibold text-lg">{formatCurrency(total, base)}{convertedTotal ? ` · ${formatCurrency(convertedTotal, preferred)}` : ''}</dd>
                  </div>
                </dl>

                <Link
                  href="/checkout"
                  className="mt-6 w-full h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors flex items-center justify-center"
                >
                  Proceed to checkout
                </Link>

                <p className="mt-4 text-xs text-ink-muted text-center">
                  Secure checkout · 6–7 day UK delivery
                </p>
              </div>
            </aside>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

function EmptyCart() {
  return (
    <div className="border border-line rounded-3xl py-20 text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-surface flex items-center justify-center mb-4">
        <ShoppingBag className="w-7 h-7 text-ink-muted" />
      </div>
      <p className="text-dark font-medium">Your cart is empty.</p>
      <p className="text-ink-muted text-sm mt-2 mb-6">Browse the shop and start filling it up.</p>
      <Link
        href="/shop"
        className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors"
      >
        Start shopping
      </Link>
    </div>
  );
}
