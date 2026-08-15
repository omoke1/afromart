"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star, Trash2 } from "lucide-react";

export type ReviewItem = {
  id: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  authorName: string | null;
  isOwner: boolean;
};

export default function ProductReviews({
  productId,
  reviews,
  average,
  count,
  canReview,
  hasReviewed,
}: {
  productId: string;
  reviews: ReviewItem[];
  average: number;
  count: number;
  canReview: boolean;
  hasReviewed: boolean;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, rating, title, body }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Could not save your review.");
      }
      setTitle("");
      setBody("");
      setRating(5);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your review.");
    } finally {
      setSubmitting(false);
    }
  }

  async function removeReview(id: string) {
    if (!confirm("Delete your review?")) return;
    await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <section className="mt-16 max-w-4xl">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Reviews</p>
          <h2 className="text-2xl lg:text-3xl font-semibold text-dark tracking-tight">
            What customers think
          </h2>
        </div>
        {count > 0 && (
          <div className="text-right">
            <p className="text-2xl font-semibold text-dark">{average.toFixed(1)}</p>
            <p className="text-xs text-ink-muted">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < Math.round(average) ? "text-amber-500" : "text-ink-muted"}>★</span>
              ))}
              <span className="ml-1">{count} review{count === 1 ? "" : "s"}</span>
            </p>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Review form */}
        <div className="order-2 lg:order-1">
          {canReview ? (
            <form onSubmit={submit} className="bg-white border border-line rounded-2xl p-5">
              <p className="text-sm font-semibold text-dark mb-4">Write a review</p>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setRating(s)}
                    aria-label={`${s} star${s === 1 ? "" : "s"}`}
                    className={s <= rating ? "text-amber-500" : "text-ink-muted"}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
              <label className="block mb-3">
                <span className="block text-xs font-medium text-ink-soft mb-1.5">Title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                  placeholder="Great quality"
                  className="w-full h-10 px-4 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
                />
              </label>
              <label className="block mb-3">
                <span className="block text-xs font-medium text-ink-soft mb-1.5">Your review</span>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={2000}
                  rows={3}
                  placeholder="How was the product?"
                  className="w-full px-4 py-3 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark resize-none"
                />
              </label>
              {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
              <button
                disabled={submitting}
                className="h-10 px-5 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors disabled:bg-line disabled:text-ink-muted"
              >
                {submitting ? "Posting…" : "Post review"}
              </button>
            </form>
          ) : hasReviewed ? (
            <div className="bg-white border border-line rounded-2xl p-5 text-sm text-ink-soft">
              You&apos;ve reviewed this product. Thanks for your feedback!
            </div>
          ) : (
            <div className="bg-white border border-line rounded-2xl p-5 text-sm text-ink-soft">
              <Link href="/login" className="font-semibold text-brand hover:underline">
                Sign in
              </Link>{" "}
              to leave a review.
            </div>
          )}
        </div>

        {/* Review list */}
        <div className="order-1 lg:order-2 space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-ink-muted">No reviews yet — be the first.</p>
          ) : (
            reviews.map((r) => (
              <article key={r.id} className="bg-white border border-line rounded-2xl p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < r.rating ? "" : "opacity-25"}>★</span>
                    ))}
                  </div>
                  <span className="text-xs text-ink-muted">{new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
                {r.title && <h3 className="mt-2 text-sm font-semibold text-dark">{r.title}</h3>}
                {r.body && <p className="mt-1.5 text-sm text-ink-soft leading-relaxed">{r.body}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-xs font-medium text-dark">— {r.authorName ?? "Verified buyer"}</p>
                  {r.isOwner && (
                    <button
                      onClick={() => removeReview(r.id)}
                      className="text-xs text-ink-muted hover:text-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
