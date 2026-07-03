"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, X } from "lucide-react";
import { useCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

const TOAST_DURATION = 3500;

export default function CartToast() {
    const { lastAdded, count, openDrawer } = useCart();
    const [visible, setVisible] = useState(false);
    const [product, setProduct] = useState<{ id: string; name: string; emoji: string; bg_color: string } | null>(null);

    useEffect(() => {
        if (!lastAdded) return;

        const supabase = createClient();
        supabase.from("products").select("id, name, emoji, bg_color").eq("id", lastAdded.productId).single().then(({ data }) => {
          setProduct(data);
          setVisible(true);
        });

        const timer = setTimeout(() => setVisible(false), TOAST_DURATION);
        return () => clearTimeout(timer);
    }, [lastAdded]);

    return (
        <AnimatePresence>
            {visible && product && (
                <motion.div
                    key={lastAdded?.at}
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] w-[calc(100vw-2rem)] max-w-sm"
                >
                    <div className="bg-dark text-white rounded-2xl shadow-2xl px-4 py-3.5 flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                            style={{ backgroundColor: product.bg_color }}
                        >
                            {product.emoji}
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium leading-tight line-clamp-1">
                                {product.name}
                            </p>
                            <p className="text-[11px] text-white/60 mt-0.5">Added to cart · {count} item{count !== 1 ? "s" : ""}</p>
                        </div>

                        <Link
                            href="/cart"
                            onClick={() => setVisible(false)}
                            className="shrink-0 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 transition-colors text-white text-xs font-semibold px-3 py-2 rounded-full"
                        >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            View cart
                        </Link>

                        <button
                            onClick={() => setVisible(false)}
                            aria-label="Dismiss"
                            className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <motion.div
                        className="absolute bottom-0 left-0 h-[3px] bg-brand rounded-full"
                        initial={{ width: "100%" }}
                        animate={{ width: "0%" }}
                        transition={{ duration: TOAST_DURATION / 1000, ease: "linear" }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
