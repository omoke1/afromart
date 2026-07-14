"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Minus, Plus, X, CreditCard, Lock, Truck,
    ShoppingCart, ChevronLeft, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NumberFlow from "@number-flow/react";
import { useCart, useCartLines } from "@/lib/cart";
import Link from "next/link";

/* ─── tiny helpers ─────────────────────────────────────────── */

function Field({
    label, name, type = "text", placeholder, defaultValue, required,
}: {
    label: string; name: string; type?: string;
    placeholder?: string; defaultValue?: string; required?: boolean;
}) {
    return (
        <label className="block">
            <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
            <input
                name={name} type={type} required={required}
                placeholder={placeholder} defaultValue={defaultValue}
                className="w-full h-11 px-4 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark transition-colors placeholder:text-ink-muted"
            />
        </label>
    );
}

function SectionHeader({ step, icon, title }: { step: number; icon?: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-3 mb-5">
            <span className="w-7 h-7 rounded-full bg-dark text-white text-xs font-semibold flex items-center justify-center shrink-0">
                {step}
            </span>
            <h2 className="text-base font-semibold text-dark flex items-center gap-2">
                {icon}{title}
            </h2>
        </div>
    );
}

/* ─── main export ───────────────────────────────────────────── */

export function InteractiveCheckout() {
    const { lines: rawLines, setQty, remove, subtotal, hydrated } = useCart();
    const lines = useCartLines();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deliveryFee = subtotal >= 40 || subtotal === 0 ? 0 : 4.99;
    const totalPrice = subtotal + deliveryFee;
    const totalItems = lines.reduce((s, i) => s + i.qty, 0);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (lines.length === 0) return;
        setError(null);
        setIsSubmitting(true);

        const fd = new FormData(e.currentTarget);
        const address = {
            email: String(fd.get("email") ?? ""),
            phone: String(fd.get("phone") ?? ""),
            name: String(fd.get("name") ?? ""),
            address1: String(fd.get("address1") ?? ""),
            address2: String(fd.get("address2") ?? ""),
            city: String(fd.get("city") ?? ""),
            postcode: String(fd.get("postcode") ?? ""),
            country: String(fd.get("country") ?? "United Kingdom"),
        };

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lines: rawLines.map((l) => ({ productId: l.productId, qty: l.qty })),
                    address,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.url) {
                throw new Error(data.error ?? "Something went wrong. Please try again.");
            }
            // Cart is cleared on the success page after payment confirms.
            window.location.href = data.url;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Checkout failed. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <Link href="/cart" className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-dark mb-6 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                Back to cart
            </Link>

            <div className="mb-10">
                <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Step 2 of 2</p>
                <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">Almost there</h1>
            </div>

            {hydrated && lines.length === 0 ? (
                <div className="border border-line rounded-3xl py-20 text-center">
                    <p className="text-dark font-medium">Your basket is empty.</p>
                    <Link href="/shop" className="mt-4 inline-block text-sm font-semibold text-brand hover:underline">
                        Browse the shop →
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-10">

                    {/* ── LEFT: billing form ── */}
                    <div className="flex-1 space-y-10">

                        {/* Contact */}
                        <section>
                            <SectionHeader step={1} title="Contact" />
                            <div className="space-y-4 pl-10">
                                <Field label="Email address" name="email" type="email" required placeholder="you@example.com" />
                                <Field label="Phone number" name="phone" type="tel" required placeholder="+44 7000 000000" />
                            </div>
                        </section>

                        {/* Delivery */}
                        <section>
                            <SectionHeader step={2} icon={<Truck className="w-4 h-4" />} title="Delivery address" />
                            <div className="space-y-4 pl-10">
                                <Field label="Full name" name="name" required />
                                <Field label="Address line 1" name="address1" required placeholder="12 Afromart Road" />
                                <Field label="Address line 2 (optional)" name="address2" placeholder="Flat / Suite" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="City" name="city" required />
                                    <Field label="Postcode" name="postcode" required />
                                </div>
                                <Field label="Country" name="country" required defaultValue="United Kingdom" />
                                <label className="flex items-center gap-2 mt-2 text-sm text-ink-soft cursor-pointer">
                                    <input type="checkbox" className="accent-brand rounded" />
                                    Save this address for next time
                                </label>
                            </div>
                        </section>

                        {/* Payment */}
                        <section>
                            <SectionHeader step={3} icon={<CreditCard className="w-4 h-4" />} title="Payment" />
                            <div className="space-y-3 pl-10">
                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-surface border border-line">
                                    <Lock className="w-4 h-4 text-dark mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-dark">Secure payment via Stripe</p>
                                        <p className="text-xs text-ink-muted mt-1">
                                            You&apos;ll be redirected to Stripe&apos;s secure checkout to enter your
                                            card details. We never see or store your card information.
                                        </p>
                                    </div>
                                </div>
                                {error && (
                                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                                        {error}
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* ── RIGHT: animated order summary ── */}
                    <motion.aside
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                            "w-full lg:w-[400px] flex flex-col",
                            "p-6 rounded-3xl",
                            "bg-white border border-line",
                            "lg:sticky lg:top-24",
                            "max-h-[85vh]"
                        )}
                    >
                        {/* Summary header */}
                        <div className="flex items-center gap-2 mb-6">
                            <ShoppingCart className="w-5 h-5 text-dark" />
                            <h2 className="text-lg font-semibold text-dark">
                                Order summary ({totalItems})
                            </h2>
                        </div>

                        {/* Line items */}
                        <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-3 min-h-[120px]">
                            <AnimatePresence initial={false} mode="popLayout">
                                {lines.map((item) => (
                                    <motion.div
                                        key={item.product.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.15 } }}
                                        transition={{ opacity: { duration: 0.2 }, layout: { duration: 0.2 } }}
                                        className="flex items-center gap-3 p-3 rounded-2xl bg-surface"
                                    >
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                                            style={{ backgroundColor: item.product.bg }}
                                        >
                                            {item.product.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <span className="text-sm font-medium text-dark line-clamp-1">
                                                    {item.product.name}
                                                </span>
                                                <motion.button
                                                    type="button"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => remove(item.product.id)}
                                                    className="p-1 shrink-0 rounded-full text-ink-muted hover:text-dark hover:bg-line transition-colors"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </motion.button>
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-1 bg-white rounded-full border border-line px-1 py-0.5">
                                                    <motion.button
                                                        type="button"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setQty(item.product.id, item.qty - 1)}
                                                        className="w-6 h-6 rounded-full flex items-center justify-center text-dark hover:bg-surface transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </motion.button>
                                                    <span className="text-xs font-semibold text-dark w-4 text-center">
                                                        {item.qty}
                                                    </span>
                                                    <motion.button
                                                        type="button"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setQty(item.product.id, item.qty + 1)}
                                                        className="w-6 h-6 rounded-full flex items-center justify-center text-dark hover:bg-surface transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </motion.button>
                                                </div>
                                                <span className="text-sm font-semibold text-dark">
                                                    £{(item.product.price * item.qty).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Totals + CTA */}
                        <motion.div layout className="pt-5 mt-4 border-t border-line">
                            <div className="space-y-3 mb-5">
                                <div className="flex justify-between text-sm text-ink-soft">
                                    <span>Subtotal</span>
                                    <span>£{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-ink-soft">
                                    <span>Delivery</span>
                                    <span>{deliveryFee === 0 ? "Free" : `£${deliveryFee.toFixed(2)}`}</span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-line">
                                    <span className="font-semibold text-dark">Total</span>
                                    <span className="text-xl font-bold text-dark flex items-center">
                                        £<NumberFlow value={totalPrice} />
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                size="lg"
                                className="w-full gap-2 rounded-full"
                                disabled={lines.length === 0 || isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <CheckCircle2 className="w-5 h-5 animate-pulse" />
                                        Redirecting to Stripe…
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-5 h-5" />
                                        Continue to payment · £{totalPrice.toFixed(2)}
                                    </>
                                )}
                            </Button>

                            <p className="mt-3 text-xs text-ink-muted text-center">
                                Secure checkout · 24–48h UK delivery
                            </p>
                        </motion.div>
                    </motion.aside>
                </form>
            )}
        </div>
    );
}
