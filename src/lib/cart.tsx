"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

export type CartLine = {
  productId: string;
  qty: number;
};

type ProductPrice = {
  id: string;
  price: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  add: (productId: string, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  hydrated: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  lastAdded: { productId: string; at: number } | null;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "afromart.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<{ productId: string; at: number } | null>(null);
  const [priceMap, setPriceMap] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartLine[];
        if (Array.isArray(parsed)) {
          const ids = parsed.map((l) => l.productId);
          if (ids.length > 0) {
            const supabase = createClient();
            supabase.from("products").select("id, price").in("id", ids).then(({ data }) => {
              const map = new Map<string, number>();
              for (const p of data ?? []) {
                map.set(p.id, Number(p.price));
              }
              setPriceMap(map);
              setLines(parsed.filter((l) => map.has(l.productId)));
            });
          } else {
            setLines(parsed);
          }
        }
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {}
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((sum, l) => {
      const price = priceMap.get(l.productId);
      return price ? sum + price * l.qty : sum;
    }, 0);

    return {
      lines,
      count,
      subtotal,
      hydrated,
      drawerOpen,
      lastAdded,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      add: (productId, qty = 1) => {
        setLines((prev) => {
          const existing = prev.find((l) => l.productId === productId);
          if (existing) {
            return prev.map((l) => (l.productId === productId ? { ...l, qty: l.qty + qty } : l));
          }
          return [...prev, { productId, qty }];
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

type CartProductInfo = {
  id: string;
  name: string;
  price: number;
  bg: string;
  emoji: string;
  weight: string;
  category: string;
};

export function useCartLines(): { product: CartProductInfo; qty: number }[] {
  const { lines } = useCart();
  const [productMap, setProductMap] = useState<Map<string, CartProductInfo>>(new Map());
  const idsRef = useRef("");

  const ids = lines.map((l) => l.productId).sort().join(",");
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (ids === idsRef.current) return;
    idsRef.current = ids;

    const idArr = lines.map((l) => l.productId);
    if (idArr.length === 0) {
      setProductMap(new Map());
      return;
    }
    let cancelled = false;
    supabase
      .from("products")
      .select("id, name, price, bg_color, emoji, weight, categories(name)")
      .in("id", idArr)
      .then(({ data }) => {
        if (cancelled) return;
        const map = new Map<string, CartProductInfo>();
        for (const p of data ?? []) {
          const category = (p.categories as { name?: string } | null)?.name ?? "";
          map.set(p.id, {
            id: p.id,
            name: p.name,
            price: Number(p.price),
            bg: p.bg_color,
            emoji: p.emoji,
            weight: p.weight ?? "",
            category,
          });
        }
        setProductMap(map);
      });
    return () => {
      cancelled = true;
    };
  }, [ids, lines, supabase]);

  return useMemo(
    () =>
      lines
        .filter((l) => productMap.has(l.productId))
        .map((l) => ({ product: productMap.get(l.productId)!, qty: l.qty })),
    [lines, productMap]
  );
}
