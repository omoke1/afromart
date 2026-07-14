import { createAdminClient } from "@/lib/supabase/admin";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

type OrderRow = { id: string; status: string; total: number; created_at: string; address: Record<string, string> | null; user_id: string | null };
type ProductRow = { id: string; emoji: string; name: string; stock: number };

async function getStats() {
  const admin = createAdminClient();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    productCountRes,
    orderCountRes,
    customerCountRes,
    recentOrdersRes,
    lowStockRes,
    dispatchQueueRes,
    allRevenueRes,
    todayRes,
    weekRes,
    monthRes,
  ] = await Promise.all([
    admin.from("products").select("*", { count: "exact", head: true }),
    admin.from("orders").select("*", { count: "exact", head: true }),
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
    admin.from("products").select("*").lte("stock", 10).order("stock").limit(5),
    admin.from("orders").select("*").in("status", ["Preparing", "Out for delivery"]).order("created_at", { ascending: false }).limit(10),
    admin.from("orders").select("total").neq("status", "Cancelled"),
    admin.from("orders").select("total").gte("created_at", startOfDay).neq("status", "Cancelled"),
    admin.from("orders").select("total").gte("created_at", startOfWeek).neq("status", "Cancelled"),
    admin.from("orders").select("total").gte("created_at", startOfMonth).neq("status", "Cancelled"),
  ]);

  const revenueData = (allRevenueRes.data ?? []) as { total: number }[];
  const revenue = revenueData.reduce((sum, o) => sum + Number(o.total), 0);

  function periodStats(data: { total: number }[] | null) {
    const rows = data ?? [];
    return { count: rows.length, revenue: rows.reduce((s, o) => s + Number(o.total), 0) };
  }

  return {
    productCount: productCountRes.count ?? 0,
    orderCount: orderCountRes.count ?? 0,
    customerCount: customerCountRes.count ?? 0,
    revenue,
    recentOrders: (recentOrdersRes.data ?? []) as OrderRow[],
    lowStock: (lowStockRes.data ?? []) as ProductRow[],
    dispatchQueue: (dispatchQueueRes.data ?? []) as OrderRow[],
    today: periodStats(todayRes.data),
    thisWeek: periodStats(weekRes.data),
    thisMonth: periodStats(monthRes.data),
  };
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h2 className="text-lg font-semibold text-dark mb-6">Dashboard</h2>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card icon={TrendingUp} label="Revenue" value={`£${stats.revenue.toFixed(2)}`} />
        <Card icon={ShoppingCart} label="Orders" value={String(stats.orderCount)} />
        <Card icon={Package} label="Products" value={String(stats.productCount)} />
        <Card icon={Users} label="Customers" value={String(stats.customerCount)} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <PeriodCard label="Today" count={stats.today.count} revenue={stats.today.revenue} />
        <PeriodCard label="This week" count={stats.thisWeek.count} revenue={stats.thisWeek.revenue} />
        <PeriodCard label="Last 30 days" count={stats.thisMonth.count} revenue={stats.thisMonth.revenue} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <section className="bg-white border border-[#e6e1d6] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-dark">Dispatch queue</h3>
              {stats.dispatchQueue.length > 0 && (
                <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                  {stats.dispatchQueue.length}
                </span>
              )}
            </div>
            <Link href="/admin/orders" className="text-xs text-brand hover:underline">View all</Link>
          </div>
          {stats.dispatchQueue.length === 0 ? (
            <p className="text-sm text-ink-muted">All caught up — nothing waiting.</p>
          ) : (
            <ul className="divide-y divide-[#e6e1d6]/50">
              {stats.dispatchQueue.map((o) => (
                <li key={o.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/orders/${o.id}`} className="text-sm font-medium text-dark hover:text-brand truncate block">
                      {o.id.slice(0, 8)}…
                    </Link>
                    <p className="text-xs text-ink-muted">
                      {o.address?.name ?? "Unknown"} · {timeAgo(o.created_at)}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white border border-[#e6e1d6] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark">Low stock alerts</h3>
            <Link href="/admin/products" className="text-xs text-brand hover:underline">View all</Link>
          </div>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-ink-muted">All products well stocked.</p>
          ) : (
            <div className="space-y-3">
              {stats.lowStock.map((p) => (
                <div key={p.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{p.emoji}</span>
                    <span className="text-sm text-dark">{p.name}</span>
                  </div>
                  <span className="text-xs font-medium text-red bg-red/10 px-2 py-0.5 rounded-full">
                    {p.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="mt-6 bg-white border border-[#e6e1d6] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-dark">Recent orders</h3>
          <Link href="/admin/orders" className="text-xs text-brand hover:underline">View all</Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-ink-muted">No orders yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-muted text-xs">
                <th className="pb-2 font-medium">Order</th>
                <th className="pb-2 font-medium">Customer</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e1d6]/50">
              {stats.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="py-2.5 text-dark font-medium">
                    <Link href={`/admin/orders/${o.id}`} className="hover:text-brand">{o.id}</Link>
                  </td>
                  <td className="py-2.5 text-ink-soft">{o.address?.name ?? "—"}</td>
                  <td className="py-2.5">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-2.5 text-right text-dark">£{Number(o.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Card({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white border border-[#e6e1d6] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#f4f1ea] flex items-center justify-center">
          <Icon className="w-4 h-4 text-dark" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-dark">{value}</p>
      <p className="text-xs text-ink-muted mt-1">{label}</p>
    </div>
  );
}

function PeriodCard({ label, count, revenue }: { label: string; count: number; revenue: number }) {
  return (
    <div className="bg-white border border-[#e6e1d6] rounded-xl p-4">
      <p className="text-xs font-medium text-ink-muted mb-2">{label}</p>
      <div className="flex items-baseline gap-3">
        <p className="text-lg font-semibold text-dark">{count} <span className="text-xs font-normal text-ink-muted">orders</span></p>
        <p className="text-sm text-ink-soft">£{revenue.toFixed(2)}</p>
      </div>
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
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${colors[status] ?? "text-ink-muted bg-[#f4f1ea]"}`}>
      {status}
    </span>
  );
}
