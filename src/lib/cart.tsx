"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export type CartLine = {
  productId: string;
  optionId: string | null;
  qty: number;
};

export function lineKey(productId: string, optionId: string | null) {
  return `${productId}::${optionId ?? ""}`;
}

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (productId: string, qty?: number, optionId?: string | null) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  setLineQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
  hydrated: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  focusedProduct?: { id: string; name?: string; img?: string | null; options?: { id: string; label: string; price?: number | string; oldPrice?: number | string; stock?: number | null }[] } | null;
  openProductDrawer?: (payload: { id: string; name?: string; img?: string | null; options?: { id: string; label: string; price?: number | string; oldPrice?: number | string; stock?: number | null }[] }) => void;
  lastAdded: { productId: string; at: number } | null;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "afromart.cart.v2";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<{ productId: string; at: number } | null>(null);
  const [focusedProduct, setFocusedProduct] = useState<{
    id: string;
    name?: string;
    img?: string | null;
    options?: { id: string; label: string; price?: number | string; oldPrice?: number | string; stock?: number | null }[];
  } | null>(null);
  const [priceMap, setPriceMap] = useState<Map<string, number>>(new Map());
  const [userId, setUserId] = useState<string | null>(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const me = await meRes.json();
        setUserId(me?.user?.id ?? null);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let parsed: { productId: string; optionId?: string | null; qty: number }[] | null = null;
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          parsed = JSON.parse(raw) as { productId: string; optionId?: string | null; qty: number }[];
        } else {
          const legacy = localStorage.getItem("afromart.cart.v1");
          if (legacy) {
            const old = JSON.parse(legacy) as { productId: string; qty: number }[];
            parsed = old.map((l) => ({ productId: l.productId, optionId: null, qty: l.qty }));
          }
        }

        if (parsed && Array.isArray(parsed)) {
          const normalized = parsed
            .map((l) => ({
              productId: l.productId,
              optionId: l.optionId ?? null,
              qty: Math.max(0, Number(l.qty) || 0),
            }))
            .filter((l) => l.productId && l.qty > 0);

          if (normalized.length > 0) {
            const ids = [...new Set(normalized.map((l) => l.productId))];
            const supabase = createClient();
            const { data } = await supabase
              .from("products")
              .select("id, price, product_options(id, price)")
              .in("id", ids);
            if (cancelled) return;
            const map = new Map<string, number>();
            for (const p of data ?? []) {
              const pid = p.id as string;
              map.set(lineKey(pid, null), Number(p.price));
              const opts = (p.product_options as unknown as { id: string; price: number }[] | null) ?? [];
              for (const opt of opts) {
                map.set(lineKey(pid, opt.id), Number(opt.price));
              }
            }
            setPriceMap(map);
            setLines(normalized.filter((l) => map.has(lineKey(l.productId, l.optionId))));
          }
        }
      } catch {}
      if (!cancelled) setHydrated(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, hydrated]);

  // Mirror the cart to the server when a signed-in user changes it, so the
  // abandoned-cart emails know what they left behind.
  useEffect(() => {
    if (!hydrated || !userId || syncingRef.current) return;
    const controller = new AbortController();
    (async () => {
      try {
        await fetch("/api/cart-tracking", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            lines: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
          }),
        });
      } catch {}
    })();
    return () => controller.abort();
  }, [lines, hydrated, userId]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((sum, l) => {
      const price = priceMap.get(lineKey(l.productId, l.optionId));
      return price ? sum + price * l.qty : sum;
    }, 0);

    return {
      lines,
      count,
      subtotal,
      hydrated,
      drawerOpen,
      lastAdded,
      focusedProduct,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => {
        setDrawerOpen(false);
        setFocusedProduct(null);
      },
      openProductDrawer: (payload: { id: string; name?: string; img?: string | null; options?: { id: string; label: string; price?: number | string; oldPrice?: number | string; stock?: number | null }[] }) => {
        setFocusedProduct(payload);
        setDrawerOpen(true);
      },
      add: (productId, qty = 1, optionId = null) => {
        const key = lineKey(productId, optionId);
        setLines((prev) => {
          const existing = prev.find((l) => lineKey(l.productId, l.optionId) === key);
          if (existing) {
            return prev.map((l) =>
              lineKey(l.productId, l.optionId) === key ? { ...l, qty: l.qty + qty } : l
            );
          }
          return [...prev, { productId, optionId, qty }];
        });
        setLastAdded({ productId, at: Date.now() });
      },
      setQty: (productId, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.productId !== productId)
            : prev.map((l) => (l.productId === productId ? { ...l, qty } : l))
        ),
      remove: (productId) => setLines((prev) => prev.filter((l) => l.productId !== productId)),
      setLineQty: (key, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => lineKey(l.productId, l.optionId) !== key)
            : prev.map((l) => (lineKey(l.productId, l.optionId) === key ? { ...l, qty } : l))
        ),
      removeLine: (key) => setLines((prev) => prev.filter((l) => lineKey(l.productId, l.optionId) !== key)),
      clear: () => setLines([]),
    };
  }, [lines, hydrated, drawerOpen, lastAdded, priceMap]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}

export type CartProductInfo = {
  id: string;
  name: string;
  price: number;
  bg: string;
  emoji: string;
  weight: string;
  category: string;
  optionId: string | null;
  stock: number | null;
};

export type CartLineDisplay = { key: string; product: CartProductInfo; qty: number };

export function useCartLines(): CartLineDisplay[] {
  const { lines } = useCart();
  const [productMap, setProductMap] = useState<Map<string, CartProductInfo>>(new Map());
  const idsRef = useRef("");

  const ids = lines.map((l) => l.productId).sort().join(",");

  useEffect(() => {
    if (ids === idsRef.current) return;
    idsRef.current = ids;

    const idArr = [...new Set(lines.map((l) => l.productId))];
    if (idArr.length === 0) return;
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("products")
      .select(
        "id, name, price, bg_color, emoji, weight, stock, categories(name), product_options(id, weight, price, stock)"
      )
      .in("id", idArr)
      .then(({ data }) => {
        if (cancelled) return;
        const map = new Map<string, CartProductInfo>();
        for (const p of data ?? []) {
          const category = (p.categories as { name?: string } | null)?.name ?? "";
          const base = {
            id: p.id,
            name: p.name,
            bg: p.bg_color,
            emoji: p.emoji,
            category,
          };
          map.set(lineKey(p.id, null), {
            ...base,
            price: Number(p.price),
            weight: p.weight ?? "",
            optionId: null,
            stock: p.stock != null ? Number(p.stock) : null,
          });
          const opts = (p.product_options as unknown as { id: string; weight: string; price: number; stock: number | null }[] | null) ?? [];
          for (const opt of opts) {
            map.set(lineKey(p.id, opt.id), {
              ...base,
              price: Number(opt.price),
              weight: opt.weight,
              optionId: opt.id,
              stock: opt.stock != null ? Number(opt.stock) : null,
            });
          }
        }
        setProductMap(map);
      });
    return () => {
      cancelled = true;
    };
  }, [ids, lines]);

  return useMemo(
    () =>
      lines
        .map((l) => {
          const key = lineKey(l.productId, l.optionId);
          const product = productMap.get(key);
          return product ? { key, product, qty: l.qty } : null;
        })
        .filter((x): x is CartLineDisplay => x !== null),
    [lines, productMap]
  );
}
