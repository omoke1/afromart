"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Minus, Plus, X, ShoppingBag, ChevronsRight } from "lucide-react";
import { useCart, useCartLines } from "@/lib/cart";
import { useExchangeRates } from '@/lib/useExchangeRates';
import { usePreferredCurrency } from '@/lib/usePreferredCurrency';
import formatCurrency from '@/lib/currency';
import { calculateShippingFee, parseWeightKg } from '@/lib/weight';
import { useShippingSettings } from '@/lib/useShippingSettings';

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

export default function CartDrawer() {
  const { drawerOpen, closeDrawer, subtotal, setLineQty, removeLine, count, focusedProduct, openProductDrawer, add } = useCart();
  const lines = useCartLines();
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Lock body scroll while open
  useEffect(() => {
    if (drawerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [drawerOpen]);

  // Close on Escape
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDrawer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  const { settings } = useShippingSettings();
  const totalKg = lines.reduce((sum, line) => {
    const parsedKg = parseWeightKg(line.product.weight);
    return sum + (parsedKg ?? 0) * line.qty;
  }, 0);

  const delivery = !settings.enabled || subtotal >= settings.free_delivery_threshold || subtotal === 0
    ? 0
    : calculateShippingFee(totalKg, settings);
  const total = subtotal + delivery;
  const remaining = Math.max(0, settings.free_delivery_threshold - subtotal);
  const progress = settings.enabled
    ? Math.min(100, (subtotal / settings.free_delivery_threshold) * 100)
    : 100;

  const { currency: preferred } = usePreferredCurrency('GBP');
  const { convert, base } = useExchangeRates();
  const convertedSubtotal = preferred && preferred !== base ? convert(subtotal, preferred) : null;
  const convertedDelivery = preferred && preferred !== base ? convert(delivery, preferred) : null;
  const convertedTotal = preferred && preferred !== base ? convert(total, preferred) : null;

  return (
    <>
      {/* Backdrop — desktop only */}
      <div
        onClick={closeDrawer}
        aria-hidden="true"
        className={
          "fixed inset-0 z-[80] bg-black/40 transition-opacity duration-300 " +
          (drawerOpen && !isMobile ? "opacity-100" : "opacity-0 pointer-events-none")
        }
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Cart"
        aria-hidden={!drawerOpen}
        className={
          "fixed z-[90] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out " +
          (isMobile
            ? "inset-0 h-full w-full " +
              (drawerOpen ? "translate-y-0" : "translate-y-full")
            : "top-0 right-0 h-full w-[420px] max-w-[92vw] " +
              (drawerOpen ? "translate-x-0" : "translate-x-full"))
        }
      >
        {/* Header */}
        <header className="px-6 h-[68px] flex items-center justify-between border-b border-line shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-dark">Your cart</h2>
            {count > 0 && (
              <span className="text-xs font-medium text-ink-soft bg-surface px-2 py-0.5 rounded-full">
                {count} {count === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="w-9 h-9 rounded-full hover:bg-surface text-dark flex items-center justify-center"
          >
            {isMobile ? <X className="w-4 h-4" /> : <ChevronsRight className="w-4 h-4" />}
          </button>
        </header>

        {/* Shipping progress */}
        {count > 0 && (
          <div className="px-6 pt-5 pb-4 border-b border-line shrink-0">
            {settings.enabled ? (
              remaining > 0 ? (
                <p className="text-xs text-ink-soft mb-2">
                  Add <strong className="text-dark">£{remaining.toFixed(2)}</strong> more for free UK delivery.
                </p>
              ) : (
                <p className="text-xs text-dark mb-2">
                  🎉 You&apos;ve unlocked <strong>free UK delivery</strong>.
                </p>
              )
            ) : (
              <p className="text-xs text-ink-soft mb-2">
                Shipping charges are currently <strong>disabled</strong>.
              </p>
            )}
            <div className="h-1.5 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-brand transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Lines or focused product options */}
        <div className="flex-1 overflow-y-auto">
          {focusedProduct ? (
            <div className="px-6">
              <h3 className="text-sm font-semibold text-dark">{focusedProduct.name}</h3>
              <p className="text-xs text-ink-muted">Select your preferred option</p>
              <div className="mt-4 space-y-3">
                {(focusedProduct.options || []).map((opt) => (
                  <div key={opt.id} className="flex items-center justify-between gap-3 bg-white rounded-md px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-md bg-surface flex items-center justify-center text-lg">{/* thumbnail placeholder */}</div>
                      <div>
                        <div className="text-sm font-medium text-dark">{opt.label}</div>
                        {opt.price && <div className="text-xs text-ink-muted">{typeof opt.price === 'number' ? `£${Number(opt.price).toFixed(2)}` : opt.price}</div>}
                        {opt.stock === 0 && <div className="text-[11px] text-red font-medium">Out of stock</div>}
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => {
                          add(focusedProduct.id, 1, opt.id || null);
                        }}
                        disabled={opt.stock === 0}
                        className="w-10 h-10 rounded-full bg-gold text-white flex items-center justify-center disabled:bg-line disabled:text-ink-muted disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : lines.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-8">
              <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center mb-4">
                <ShoppingBag className="w-6 h-6 text-ink-muted" />
              </div>
              <p className="text-dark font-medium">Your cart is empty.</p>
              <p className="text-ink-muted text-sm mt-1">Browse the shop and start filling it up.</p>
              <Link
                href="/shop"
                onClick={closeDrawer}
                className="mt-6 h-11 px-6 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors flex items-center justify-center"
              >
                Start shopping
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line px-6">
              {lines.map(({ key, product, qty }) => (
                <li key={key} className="py-5 flex gap-3">
                  <Link
                    href={`/shop/${product.id}`}
                    onClick={closeDrawer}
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
                    style={{ backgroundColor: product.bg }}
                  >
                    {product.emoji}
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="text-[10px] tracking-[0.14em] uppercase text-ink-muted">
                      {product.category}
                    </p>
                    <Link
                      href={`/shop/${product.id}`}
                      onClick={closeDrawer}
                      className="text-sm font-medium text-dark hover:text-brand line-clamp-2"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-ink-muted mt-0.5">{product.weight}</p>

                    <div className="mt-auto pt-2 flex items-center justify-between gap-3">
                      <div className="flex items-center border border-line rounded-full px-1 h-8">
                        <button
                          onClick={() => setLineQty(key, qty - 1)}
                          aria-label="Decrease quantity"
                          className="w-6 h-6 rounded-full hover:bg-surface text-dark flex items-center justify-center"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 text-center font-semibold text-dark text-xs">{qty}</span>
                        <button
                          onClick={() => setLineQty(key, qty + 1)}
                          disabled={qty >= product.stock}
                          aria-label="Increase quantity"
                          className="w-6 h-6 rounded-full hover:bg-surface text-dark flex items-center justify-center disabled:text-ink-muted disabled:cursor-not-allowed"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-dark">
                        £{(product.price * qty).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeLine(key)}
                    aria-label={`Remove ${product.name}`}
                    className="w-7 h-7 rounded-full text-ink-muted hover:text-brand flex items-center justify-center shrink-0 -mt-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <footer className="border-t border-line px-6 pt-5 pb-6 shrink-0 bg-white">
            <dl className="space-y-2 text-sm mb-4">
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
              <div className="flex justify-between pt-2 border-t border-line">
                <dt className="text-dark font-semibold">Total</dt>
                <dd className="text-dark font-semibold text-lg">{formatCurrency(total, base)}{convertedTotal ? ` · ${formatCurrency(convertedTotal, preferred)}` : ''}</dd>
              </div>
            </dl>

            {focusedProduct ? (
              <>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="w-full h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors flex items-center justify-center"
                >
                  Continue
                </Link>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="mt-2 w-full text-center text-sm font-medium text-ink-soft hover:text-dark block"
                >
                  View full cart
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="w-full h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors flex items-center justify-center"
                >
                  Proceed to checkout
                </Link>
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="mt-2 w-full text-center text-sm font-medium text-ink-soft hover:text-dark block"
                >
                  View full cart
                </Link>
              </>
            )}
          </footer>
        )}
      </aside>
    </>
  );
}
