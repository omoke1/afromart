"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Trash2, ChevronRight, CreditCard } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/layout/AccountSidebar";

type Card = {
  id: string;
  brand: "Visa" | "Mastercard" | "Amex";
  last4: string;
  expiry: string;
  isDefault?: boolean;
};

const initial: Card[] = [
  { id: "c1", brand: "Visa", last4: "4242", expiry: "12 / 28", isDefault: true },
  { id: "c2", brand: "Mastercard", last4: "8821", expiry: "07 / 27" },
];

const brandBg: Record<Card["brand"], string> = {
  Visa: "linear-gradient(135deg, #1a1f71 0%, #2e3692 100%)",
  Mastercard: "linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)",
  Amex: "linear-gradient(135deg, #2e77bb 0%, #006fcf 100%)",
};

export default function PaymentPage() {
  const [cards, setCards] = useState<Card[]>(initial);

  const makeDefault = (id: string) =>
    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === id })));
  const remove = (id: string) => setCards((prev) => prev.filter((c) => c.id !== id));

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />

      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8 flex-wrap">
          <Link href="/" className="hover:text-dark">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/account" className="hover:text-dark">Account</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-dark">Payment methods</span>
        </nav>

        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Account</p>
        <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">Payment methods</h1>

        <div className="mt-10 grid lg:grid-cols-[240px_1fr] gap-10">
          <AccountSidebar />

          <section>
            <div className="grid sm:grid-cols-2 gap-6">
              {cards.map((c) => (
                <div key={c.id}>
                  <div
                    className="aspect-[1.6/1] rounded-2xl p-5 text-white flex flex-col justify-between shadow-lg"
                    style={{ background: brandBg[c.brand] }}
                  >
                    <div className="flex items-center justify-between">
                      <CreditCard className="w-6 h-6" />
                      <span className="text-sm font-semibold">{c.brand}</span>
                    </div>
                    <div>
                      <p className="text-lg tracking-[0.2em] font-mono">•••• •••• •••• {c.last4}</p>
                      <p className="text-xs opacity-80 mt-2">Expires {c.expiry}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-sm">
                    {c.isDefault ? (
                      <span className="text-[10px] font-semibold text-dark bg-gold px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    ) : (
                      <button onClick={() => makeDefault(c.id)} className="text-ink-soft hover:text-dark">
                        Make default
                      </button>
                    )}
                    <button
                      onClick={() => remove(c.id)}
                      className="ml-auto text-ink-muted hover:text-brand flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button className="border border-dashed border-line rounded-2xl flex flex-col items-center justify-center text-ink-soft hover:border-dark hover:text-dark transition-colors aspect-[1.6/1]">
                <Plus className="w-6 h-6 mb-2" />
                <span className="font-medium">Add a new card</span>
              </button>
            </div>

            <p className="mt-8 text-xs text-ink-muted">
              Cards are securely tokenised by our payment provider. AfroMart never stores your card number.
            </p>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
