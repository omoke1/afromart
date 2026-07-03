"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Truck, Package, Check, MapPin, Search } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";
import { createClient } from "@/lib/supabase/client";

type ResultState =
  | { kind: "idle" }
  | { kind: "found"; orderId: string; date: string; status: string; items: number; total: number }
  | { kind: "not-found"; orderId: string };

export default function TrackOrderPage() {
  const [result, setResult] = useState<ResultState>({ kind: "idle" });
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { data: order } = await supabase
      .from("orders")
      .select("id, created_at, status, subtotal, delivery, items:order_items(count)")
      .eq("id", orderId.trim().toUpperCase())
      .single();

    setLoading(false);

    if (!order) {
      setResult({ kind: "not-found", orderId });
      return;
    }

    setResult({
      kind: "found",
      orderId: order.id,
      date: new Date(order.created_at).toLocaleDateString("en-GB", {
        day: "numeric", month: "long", year: "numeric",
      }),
      status: order.status,
      items: (order.items as { count: number }[] | null)?.length ?? 0,
      total: Number(order.subtotal) + Number(order.delivery),
    });
  };

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />
      <PageHero
        eyebrow="Track order"
        title="Where&apos;s my parcel?"
        blurb="No account needed. Enter your order number and the email you used at checkout."
        crumbs={[{ label: "Home", href: "/" }, { label: "Track order" }]}
        bg="var(--color-surface)"
      />

      <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 py-16 flex-1">
        <form onSubmit={onSubmit} className="space-y-4 border border-line rounded-2xl p-6">
          <label className="block">
            <span className="block text-xs font-medium text-ink-soft mb-1.5">Order number</span>
            <input
              required
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="AFM-J9X2K1"
              className="w-full h-11 px-4 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
            />
          </label>
          <label className="block">
            <span className="block text-xs font-medium text-ink-soft mb-1.5">Email address</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-11 px-4 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {loading ? "Searching..." : "Track order"}
          </button>
          <p className="text-xs text-ink-muted text-center">
            Try <code className="bg-surface px-1.5 py-0.5 rounded">AFM-J9X2K1</code> for a demo.
          </p>
        </form>

        {result.kind === "not-found" && (
          <div className="mt-8 border border-line rounded-2xl p-6 text-center">
            <p className="text-dark font-medium">No order found for &ldquo;{result.orderId}&rdquo;.</p>
            <p className="mt-2 text-sm text-ink-soft">
              Double-check the order number and email you used at checkout. If you still can&apos;t find it,{" "}
              <Link href="/contact" className="text-dark font-semibold hover:text-brand">
                contact us
              </Link>
              .
            </p>
          </div>
        )}

        {result.kind === "found" && (
          <div className="mt-8 border border-line rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted">Order</p>
                <p className="text-lg font-semibold text-dark mt-1">{result.orderId}</p>
              </div>
              <span className="text-xs font-medium text-green bg-green/10 px-3 py-1.5 rounded-full">
                {result.status}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              <Step icon={<Check className="w-4 h-4" />} label="Placed" done />
              <Step icon={<Package className="w-4 h-4" />} label="Packed" done />
              <Step icon={<Truck className="w-4 h-4" />} label="Out" done />
              <Step icon={<MapPin className="w-4 h-4" />} label="Delivered" done={result.status === "Delivered"} />
            </div>

            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-ink-muted text-xs">Placed</dt>
                <dd className="text-dark font-medium mt-0.5">{result.date}</dd>
              </div>
              <div>
                <dt className="text-ink-muted text-xs">Items</dt>
                <dd className="text-dark font-medium mt-0.5">{result.items}</dd>
              </div>
              <div>
                <dt className="text-ink-muted text-xs">Total</dt>
                <dd className="text-dark font-medium mt-0.5">£{result.total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

function Step({ icon, label, done }: { icon: React.ReactNode; label: string; done?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={
          "w-9 h-9 rounded-full flex items-center justify-center " +
          (done ? "bg-green text-white" : "bg-surface text-ink-muted")
        }
      >
        {icon}
      </div>
      <span className="text-[11px] text-ink-soft">{label}</span>
    </div>
  );
}
