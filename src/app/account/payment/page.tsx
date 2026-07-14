"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronRight, CreditCard, X, Loader2 } from "lucide-react";
import AccountSidebar from "@/components/layout/AccountSidebar";
import { createClient } from "@/lib/supabase/client";

type Card = {
  id: string;
  brand: "Visa" | "Mastercard" | "Amex";
  last4: string;
  expiry: string;
  is_default: boolean;
};

const brandBg: Record<Card["brand"], string> = {
  Visa: "linear-gradient(135deg, #1a1f71 0%, #2e3692 100%)",
  Mastercard: "linear-gradient(135deg, #eb001b 0%, #f79e1b 100%)",
  Amex: "linear-gradient(135deg, #2e77bb 0%, #006fcf 100%)",
};

export default function PaymentPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ brand: "Visa" as Card["brand"], last4: "", expiry: "" });
  const [saving, setSaving] = useState(false);

  async function loadCards() {
    const supabase = createClient();
    const { data } = await supabase
      .from("payment_methods")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });
    setCards((data ?? []) as Card[]);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("payment_methods")
        .select("*")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true });
      if (cancelled) return;
      setCards((data ?? []) as Card[]);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("payment_methods").insert({
      user_id: user!.id,
      brand: form.brand,
      last4: form.last4,
      expiry: form.expiry,
    });
    setFormOpen(false);
    setForm({ brand: "Visa", last4: "", expiry: "" });
    await loadCards();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("payment_methods").delete().eq("id", id);
    await loadCards();
  }

  async function handleMakeDefault(id: string) {
    const supabase = createClient();
    await supabase.from("payment_methods").update({ is_default: false }).neq("id", id);
    await supabase.from("payment_methods").update({ is_default: true }).eq("id", id);
    await loadCards();
  }

  return (
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
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
            </div>
          ) : (
            <>
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
                        <p className="text-lg tracking-[0.2em] font-mono">
                          &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; {c.last4}
                        </p>
                        <p className="text-xs opacity-80 mt-2">Expires {c.expiry}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3 text-sm">
                      {c.is_default ? (
                        <span className="text-[10px] font-semibold text-dark bg-gold px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMakeDefault(c.id)}
                          className="text-ink-soft hover:text-dark"
                        >
                          Make default
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="ml-auto text-ink-muted hover:text-brand flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={() => setFormOpen(true)}
                  className="border border-dashed border-line rounded-2xl flex flex-col items-center justify-center text-ink-soft hover:border-dark hover:text-dark transition-colors aspect-[1.6/1]"
                >
                  <Plus className="w-6 h-6 mb-2" />
                  <span className="font-medium">Add a new card</span>
                </button>
              </div>

              <p className="mt-8 text-xs text-ink-muted">
                Cards are securely tokenised by our payment provider. AfroMart never stores your card number.
              </p>
            </>
          )}

          {formOpen && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-dark">Add a card</h2>
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="text-ink-muted hover:text-dark"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div>
                  <label className="block text-sm text-ink-soft mb-1.5">Card brand</label>
                  <select
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value as Card["brand"] })}
                    className="w-full h-11 px-4 rounded-xl border border-line text-sm focus:outline-none focus:border-dark bg-white"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">Amex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-ink-soft mb-1.5">Last 4 digits</label>
                  <input
                    placeholder="1234"
                    required
                    maxLength={4}
                    pattern="[0-9]{4}"
                    value={form.last4}
                    onChange={(e) => setForm({ ...form, last4: e.target.value.replace(/\D/g, "") })}
                    className="w-full h-11 px-4 rounded-xl border border-line text-sm focus:outline-none focus:border-dark font-mono tracking-widest"
                  />
                </div>
                <div>
                  <label className="block text-sm text-ink-soft mb-1.5">Expiry</label>
                  <input
                    placeholder="MM / YY"
                    required
                    value={form.expiry}
                    onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                    className="w-full h-11 px-4 rounded-xl border border-line text-sm focus:outline-none focus:border-dark"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="flex-1 h-11 rounded-full border border-line text-dark text-sm font-semibold hover:bg-surface transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-11 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Add card"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
