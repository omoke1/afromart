"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

type Review = {
  id: string;
  rating: number;
  title: string;
  body: string;
  is_approved: boolean;
  created_at: string;
  products: { name: string } | null;
  profiles: { name: string | null } | null;
};

export default function ReviewsAdmin() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [onlyPending, setOnlyPending] = useState(true);

  function load() {
    const params = new URLSearchParams();
    if (onlyPending) params.set("pending", "true");
    return fetch(`/api/admin/reviews?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        setReviews((json.reviews ?? []) as Review[]);
        setTotal((json.total ?? 0) as number);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [onlyPending]);

  async function setApproved(r: Review, approved: boolean) {
    await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, is_approved: approved }),
    });
    await load();
  }

  async function remove(r: Review) {
    if (!confirm("Delete this review permanently?")) return;
    await fetch("/api/admin/reviews", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id }),
    });
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark">Reviews</h2>
        <button
          onClick={() => {
            setLoading(true);
            setOnlyPending((v) => !v);
          }}
          className="h-9 px-4 rounded-full border border-[#e6e1d6] text-sm font-medium text-dark hover:border-dark transition-colors"
        >
          {onlyPending ? "Showing pending only" : "Showing all reviews"}
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-ink-muted py-8 text-center">Loading…</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-ink-muted py-8 text-center">
            {onlyPending ? "No reviews waiting for approval. 🎉" : "No reviews yet."}
          </p>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="bg-white border border-[#e6e1d6] rounded-xl p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-amber-500">{Array.from({ length: 5 }).map((_, i) => (i < r.rating ? "★" : "☆")).join("")}</span>
                    <span className="text-sm font-semibold text-dark">{r.title || "Untitled"}</span>
                    {!r.is_approved && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {r.products?.name ?? "Unknown product"} · {r.profiles?.name ?? "Anonymous"} · {new Date(r.created_at).toLocaleDateString()}
                  </p>
                  {r.body && <p className="mt-2 text-sm text-ink-soft">{r.body}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!r.is_approved ? (
                    <button
                      onClick={() => setApproved(r, true)}
                      className="flex items-center gap-1 h-8 px-3 rounded-full bg-green/10 text-green text-xs font-medium hover:bg-green/20 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                  ) : (
                    <button
                      onClick={() => setApproved(r, false)}
                      className="flex items-center gap-1 h-8 px-3 rounded-full bg-amber-50 text-amber-700 text-xs font-medium hover:bg-amber-100 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" /> Hide
                    </button>
                  )}
                  <button
                    onClick={() => remove(r)}
                    className="h-8 px-3 rounded-full text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <p className="mt-4 text-xs text-ink-muted">{total} review{total === 1 ? "" : "s"} total</p>
    </div>
  );
}
