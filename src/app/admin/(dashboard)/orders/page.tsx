"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { CsvExportButton } from "@/components/admin/CsvExportButton";

type Order = {
  id: string;
  address: { name?: string; city?: string } | null;
  created_at: string;
  status: string;
  total: number;
  courier: string | null;
  tracking_number: string | null;
};

const STATUS_TABS = ["All", "Preparing", "Out for delivery", "Delivered", "Cancelled", "Refunded", "Ready for pickup"] as const;
const PER_PAGE = 20;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({ All: 0 });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]>("All");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [tab, debouncedQuery]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (tab !== "All") params.set("status", tab);
    if (debouncedQuery) params.set("q", debouncedQuery);
    fetch(`/api/admin/orders?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        setOrders((data.orders ?? []) as Order[]);
        setCounts((data.counts ?? { All: 0 }) as Record<string, number>);
        setTotal((data.total ?? 0) as number);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [tab, debouncedQuery, page]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const safePage = Math.min(page, totalPages);

  const exportUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (tab !== "All") params.set("status", tab);
    if (debouncedQuery) params.set("q", debouncedQuery);
    const s = params.toString();
    return `/api/admin/orders/export${s ? `?${s}` : ""}`;
  }, [tab, debouncedQuery]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark">Orders</h2>
        <CsvExportButton url={exportUrl} />
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => setTab(s)}
              className={
                "h-8 px-3.5 rounded-full text-xs font-medium border transition-colors " +
                (tab === s
                  ? "bg-dark text-white border-dark"
                  : "bg-white text-ink-soft border-[#e6e1d6] hover:border-dark hover:text-dark")
              }
            >
              {s} <span className="opacity-60">{counts[s] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order, customer, tracking…"
            className="h-9 pl-9 pr-4 w-64 border border-[#e6e1d6] rounded-full text-sm text-dark bg-white focus:outline-none focus:border-dark"
          />
        </div>
      </div>

      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted text-xs border-b border-[#e6e1d6]">
              <th className="py-3 px-4 font-medium">Order</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Customer</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium">Dispatch</th>
              <th className="py-3 px-4 font-medium text-right">Total</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e1d6]/50">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-ink-muted">Loading…</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-ink-muted">No orders match.</td></tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#fafaf7]">
                  <td className="py-3 px-4 font-medium text-dark">{o.id.slice(0, 8)}…</td>
                  <td className="py-3 px-4 text-ink-soft">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4 text-ink-soft">{o.address?.name ?? "—"}</td>
                  <td className="py-3 px-4"><StatusBadge status={o.status} /></td>
                  <td className="py-3 px-4">
                    {o.tracking_number ? (
                      <span className="text-xs text-dark">
                        {o.courier ?? "Sent"} · <span className="font-mono text-ink-soft">{o.tracking_number}</span>
                      </span>
                    ) : (
                      <span className="text-xs text-ink-muted">Not dispatched</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-dark font-medium">£{Number(o.total).toFixed(2)}</td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/admin/orders/${o.id}`} className="text-xs text-ink-soft hover:text-dark">
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-ink-muted">
            {total} orders · Page {safePage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="h-8 px-3 rounded-lg border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="h-8 px-3 rounded-lg border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Delivered: "text-green bg-green/10",
    "Out for delivery": "text-blue-700 bg-blue-50",
    Preparing: "text-amber-700 bg-amber-50",
    Cancelled: "text-red-600 bg-red-50",
    Refunded: "text-purple-700 bg-purple-50",
    "Ready for pickup": "text-teal-700 bg-teal-50",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] ?? "text-ink-muted bg-[#f4f1ea]"}`}>
      {status}
    </span>
  );
}
