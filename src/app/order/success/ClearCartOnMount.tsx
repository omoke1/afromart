"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart";

/** Clears the local basket once, after a confirmed return from Stripe checkout. */
export default function ClearCartOnMount() {
  const { clear } = useCart();
  useEffect(() => {
    clear();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
