"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";

const amounts = [10, 25, 50, 100];

function GiftCardsInner() {
  const params = useSearchParams();
  const success = params.get("success") === "1";
  const cancelled = params.get("cancelled") === "1";

  const [amount, setAmount] = useState(25);
  const [custom, setCustom] = useState("");
  const [to, setTo] = useState("");
  const [email, setEmail] = useState("");
  const [from, setFrom] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [buying, setBuying] = useState(false);

  const selected = custom ? Number(custom) : amount;

  async function handlePurchase(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!selected || selected < 5) {
      setError("Gift cards start at £5.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid recipient email.");
      return;
    }

    setBuying(true);
    try {
      const res = await fetch("/api/gift-cards/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: selected,
          recipientEmail: email.trim(),
          recipientName: to.trim(),
          senderName: from.trim(),
          message: message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Something went wrong. Please try again.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setBuying(false);
    }
  }

  return (
    <div className="max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex-1 grid lg:grid-cols-2 gap-12 items-start">
      {success && (
        <div className="lg:col-span-2 rounded-2xl bg-green/10 border border-green/30 text-green px-5 py-4 text-sm">
          Payment successful — the gift card will be emailed to {email || "the recipient"} shortly.
        </div>
      )}
      {cancelled && (
        <div className="lg:col-span-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 px-5 py-4 text-sm">
          Payment was cancelled. No charge was made.
        </div>
      )}

      {/* Preview */}
      <div className="aspect-[4/3] rounded-3xl p-10 flex flex-col justify-between bg-gradient-to-br from-brand to-[#b53000] text-white shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold tracking-wide">AFROMART</span>
          <span className="text-[10px] tracking-[0.18em] uppercase opacity-80">Gift card</span>
        </div>
        <div>
          <p className="text-5xl lg:text-6xl font-semibold tracking-tight">
            £{selected || 0}
          </p>
          <p className="mt-2 text-sm opacity-90">A taste of home, on us.</p>
        </div>
      </div>

      {/* Form */}
      <form className="space-y-6" onSubmit={handlePurchase}>
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
              max={500}
              placeholder="Custom"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              className="w-28 px-4 h-10 rounded-full border border-line text-sm text-dark focus:outline-none focus:border-dark"
            />
          </div>
        </div>

        <Field label="Recipient name" name="to" value={to} onChange={setTo} />
        <Field label="Recipient email" name="email" type="email" value={email} onChange={setEmail} required />
        <Field label="From (your name)" name="from" value={from} onChange={setFrom} />
        <label className="block">
          <span className="block text-xs font-medium text-ink-soft mb-1.5">Personal message</span>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-3 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark resize-none"
            placeholder="A little jollof on me — enjoy."
          />
        </label>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          disabled={buying}
          className="w-full h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors disabled:bg-line disabled:text-ink-muted"
        >
          {buying ? "Opening secure checkout…" : `Buy gift card · £${selected || 0}`}
        </button>
        <p className="text-xs text-ink-muted">Delivered by email to the recipient. Never expires.</p>
      </form>
    </div>
  );
}

export default function GiftCardsPage() {
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

      <Suspense fallback={null}>
        <GiftCardsInner />
      </Suspense>

      <Footer />
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
      />
    </label>
  );
}
