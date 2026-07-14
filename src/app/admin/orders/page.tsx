"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Order = {
  id: string;
  address: { name?: string; city?: string } | null;
  created_at: string;
  status: string;
  total: number;
  courier: string | null;
  tracking_number: string | null;
};

const STATUS_TABS = ["All", "Preparing", "Out for delivery", "Delivered", "Cancelled"] as const;
const PER_PAGE = 20;

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]>("All");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as unknown as Order[]);
        setLoading(false);
      });
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: orders.length };
    for (const s of STATUS_TABS) if (s !== "All") c[s] = 0;
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (tab !== "All" && o.status !== tab) return false;
      if (!q) return true;
      return (
        o.id.toLowerCase().includes(q) ||
        (o.address?.name ?? "").toLowerCase().includes(q) ||
        (o.tracking_number ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, tab, query]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = visible.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // Reset page when filters change — safePage clamps via Math.min

  function exportCsv() {
    const rows = [
      ["Order ID", "Date", "Customer", "City", "Status", "Courier", "Tracking", "Total"],
      ...visible.map((o) => [
        o.id,
        new Date(o.created_at).toISOString().slice(0, 10),
        o.address?.name ?? "",
        o.address?.city ?? "",
        o.status,
        o.courier ?? "",
        o.tracking_number ?? "",
        Number(o.total).toFixed(2),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `afromart-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark">Orders</h2>
        <button
          onClick={exportCsv}
          disabled={visible.length === 0}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-[#e6e1d6] text-xs font-semibold text-dark hover:bg-white transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>
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
            ) : paged.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-ink-muted">No orders match.</td></tr>
            ) : (
              paged.map((o) => (
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
            {visible.length} orders · Page {safePage} of {totalPages}
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
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] ?? "text-ink-muted bg-[#f4f1ea]"}`}>
      {status}
    </span>
  );
}
