"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";

const amounts = [10, 25, 50, 100];

export default function GiftCardsPage() {
  const [amount, setAmount] = useState(25);
  const [custom, setCustom] = useState("");

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />
      <PageHero
        eyebrow="Gift cards"
        title="Send a taste of home."
        blurb="Digital gift cards redeemable on anything at AfroMart. Delivered by email, never expire."
        crumbs={[{ label: "Home", href: "/" }, { label: "Gift Cards" }]}
        bg="var(--color-surface)"
      />

      <div className="max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex-1 grid lg:grid-cols-2 gap-12 items-start">
        {/* Preview */}
        <div className="aspect-[4/3] rounded-3xl p-10 flex flex-col justify-between bg-gradient-to-br from-brand to-[#b53000] text-white shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold tracking-wide">AFROMART</span>
            <span className="text-[10px] tracking-[0.18em] uppercase opacity-80">Gift card</span>
          </div>
          <div>
            <p className="text-5xl lg:text-6xl font-semibold tracking-tight">
              £{custom || amount}
            </p>
            <p className="mt-2 text-sm opacity-90">A taste of home, on us.</p>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-6">
          <div>
            <p className="text-xs font-medium text-ink-soft mb-2">Choose an amount</p>
            <div className="flex flex-wrap gap-2">
              {amounts.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => { setAmount(a); setCustom(""); }}
                  className={
                    "px-5 py-2.5 rounded-full text-sm font-medium border transition-colors " +
                    (amount === a && !custom
                      ? "bg-dark text-white border-dark"
                      : "bg-white text-dark border-line hover:border-dark")
                  }
                >
                  £{a}
                </button>
              ))}
              <input
                type="number"
                min={5}
                placeholder="Custom"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="w-28 px-4 h-10 rounded-full border border-line text-sm text-dark focus:outline-none focus:border-dark"
              />
            </div>
          </div>

          <Field label="Recipient name" name="to" />
          <Field label="Recipient email" name="email" type="email" />
          <Field label="From (your name)" name="from" />
          <label className="block">
            <span className="block text-xs font-medium text-ink-soft mb-1.5">Personal message</span>
            <textarea
              rows={4}
              className="w-full px-4 py-3 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark resize-none"
              placeholder="A little jollof on me — enjoy."
            />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-ink-soft mb-1.5">Send on</span>
            <input
              type="date"
              className="w-full h-11 px-4 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
            />
          </label>

          <button className="w-full h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors">
            Add gift card to cart · £{custom || amount}
          </button>
          <p className="text-xs text-ink-muted">Delivered by email. Redeemable for 5 years.</p>
        </form>
      </div>

      <Footer />
    </main>
  );
}

function Field({ label, name, type = "text" }: { label: string; name: string; type?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        className="w-full h-11 px-4 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
      />
    </label>
  );
}
