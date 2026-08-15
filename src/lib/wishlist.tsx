"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

type WishlistContextValue = {
  ids: string[];
  has: (productId: string) => boolean;
  toggle: (productId: string) => void;
  remove: (productId: string) => void;
  clear: () => void;
  count: number;
  hydrated: boolean;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "afromart.wishlist.v1";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const mergingRef = useRef(false);

  // On mount: load the local wishlist, then if signed in merge the account
  // wishlist in (union of both) so nothing is lost.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let local: string[] = [];
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as string[];
          if (Array.isArray(parsed)) local = parsed;
        }
      } catch {}

      let uid: string | null = null;
      try {
        const meRes = await fetch("/api/auth/me");
        const me = await meRes.json();
        uid = me?.user?.id ?? null;
      } catch {}

      let merged = local;
      if (uid) {
        try {
          const wishRes = await fetch("/api/wishlist");
          const wish = await wishRes.json();
          const remote = Array.isArray(wish.productIds) ? (wish.productIds as string[]) : [];
          merged = Array.from(new Set([...local, ...remote]));
        } catch {}
      }

      if (merged.length > 0) {
        try {
          const supabase = createClient();
          const { data } = await supabase.from("products").select("id").in("id", merged);
          const valid = new Set((data ?? []).map((p) => p.id));
          merged = merged.filter((id) => valid.has(id));
        } catch {}
      }

      if (cancelled) return;
      setUserId(uid);
      mergingRef.current = true;
      setIds(merged);
      setHydrated(true);
      mergingRef.current = false;
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {}
  }, [ids, hydrated]);

  // Push changes to the account whenever a signed-in user toggles an item.
  useEffect(() => {
    if (!hydrated || !userId || mergingRef.current) return;
    const controller = new AbortController();
    (async () => {
      try {
        await fetch("/api/wishlist", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({ productIds: ids }),
        });
      } catch {}
    })();
    return () => controller.abort();
  }, [ids, hydrated, userId]);

  const value = useMemo<WishlistContextValue>(
    () => ({
      ids,
      count: ids.length,
      hydrated,
      has: (productId) => ids.includes(productId),
      toggle: (productId) =>
        setIds((prev) =>
          prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
        ),
      remove: (productId) => setIds((prev) => prev.filter((id) => id !== productId)),
      clear: () => setIds([]),
    }),
    [ids, hydrated]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
