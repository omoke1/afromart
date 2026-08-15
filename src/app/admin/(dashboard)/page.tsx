import { createAdminClient } from "@/lib/supabase/admin";
import { Package, ShoppingCart, Users, TrendingUp, Star, Wallet } from "lucide-react";
import Link from "next/link";

type OrderRow = { id: string; status: string; total: number; created_at: string; address: Record<string, string> | null; user_id: string | null };
type ProductRow = { id: string; emoji: string; name: string; stock: number };

async function getStats() {
  const admin = createAdminClient();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const startOfMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const startOf14 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13).toISOString();

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
    trendRes,
    topProductsRes,
    newCustomersRes,
    todayCustomersRes,
    weekCustomersRes,
    monthCustomersRes,
    statusRes,
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
    admin.from("orders").select("total, created_at").gte("created_at", startOf14).neq("status", "Cancelled"),
    admin
      .from("order_items")
      .select("product_id, qty, products(name, emoji, id)")
      .gte("created_at", startOfMonth)
      .order("qty", { ascending: false })
      .limit(50),
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", startOf14),
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", startOfDay),
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", startOfWeek),
    admin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", startOfMonth),
    admin.from("orders").select("status"),
  ]);

  const revenueData = (allRevenueRes.data ?? []) as { total: number }[];
  const revenue = revenueData.reduce((sum, o) => sum + Number(o.total), 0);

  function periodStats(data: { total: number }[] | null) {
    const rows = data ?? [];
    return { count: rows.length, revenue: rows.reduce((s, o) => s + Number(o.total), 0) };
  }

  // Revenue per day for the last 14 days (local calendar days).
  const trendDays: { day: string; revenue: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    trendDays.push({ day: `${d.getMonth() + 1}/${d.getDate()}`, revenue: 0 });
  }
  const dayIndex = new Map(trendDays.map((t, idx) => [t.day, idx]));
  for (const o of (trendRes.data ?? []) as { total: number; created_at: string }[]) {
    const d = new Date(o.created_at);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    const idx = dayIndex.get(key);
    if (idx !== undefined) trendDays[idx].revenue += Number(o.total);
  }
  const trend = trendDays;
  const trendPeak = Math.max(...trend.map((t) => t.revenue), 1);

  // New customers per day for the last 14 days.
  const customerDays: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    customerDays.push({ day: `${d.getMonth() + 1}/${d.getDate()}`, count: 0 });
  }
  const cDayIndex = new Map(customerDays.map((t, idx) => [t.day, idx]));
  for (const p of (newCustomersRes.data ?? []) as { created_at: string }[]) {
    const d = new Date(p.created_at);
    const key = `${d.getMonth() + 1}/${d.getDate()}`;
    const idx = cDayIndex.get(key);
    if (idx !== undefined) customerDays[idx].count += 1;
  }

  // Top-selling products by units sold (last 30 days).
  const qtyByProduct = new Map<string, { qty: number; name: string; emoji: string }>();
  for (const item of (topProductsRes.data ?? []) as {
    product_id: string;
    qty: number;
    products: { name: string; emoji: string } | null;
  }[]) {
    const existing = qtyByProduct.get(item.product_id);
    const product = item.products ?? { name: "Deleted product", emoji: "❓" };
    if (existing) existing.qty += item.qty;
    else qtyByProduct.set(item.product_id, { qty: item.qty, name: product.name, emoji: product.emoji });
  }
  const topProducts = Array.from(qtyByProduct.values())
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // Order status breakdown.
  const statusCounts: Record<string, number> = {};
  for (const o of (statusRes.data ?? []) as { status: string }[]) {
    statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
  }

  const orderCount = orderCountRes.count ?? 0;
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  return {
    productCount: productCountRes.count ?? 0,
    orderCount,
    customerCount: customerCountRes.count ?? 0,
    revenue,
    recentOrders: (recentOrdersRes.data ?? []) as OrderRow[],
    lowStock: (lowStockRes.data ?? []) as ProductRow[],
    dispatchQueue: (dispatchQueueRes.data ?? []) as OrderRow[],
    today: periodStats(todayRes.data),
    thisWeek: periodStats(weekRes.data),
    thisMonth: periodStats(monthRes.data),
    trend,
    trendPeak,
    customerTrend: customerDays,
    customerPeak: Math.max(...customerDays.map((d) => d.count), 1),
    newCustomersToday: todayCustomersRes.count ?? 0,
    newCustomersWeek: weekCustomersRes.count ?? 0,
    newCustomersMonth: monthCustomersRes.count ?? 0,
    topProducts,
    avgOrderValue,
    statusCounts,
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

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card icon={TrendingUp} label="Revenue" value={`£${stats.revenue.toFixed(2)}`} />
        <Card icon={ShoppingCart} label="Orders" value={String(stats.orderCount)} />
        <Card icon={Wallet} label="Avg order" value={`£${stats.avgOrderValue.toFixed(2)}`} />
        <Card icon={Users} label="Customers" value={String(stats.customerCount)} />
        <Card icon={Package} label="Products" value={String(stats.productCount)} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <PeriodCard label="Today" count={stats.today.count} revenue={stats.today.revenue} />
        <PeriodCard label="This week" count={stats.thisWeek.count} revenue={stats.thisWeek.revenue} />
        <PeriodCard label="Last 30 days" count={stats.thisMonth.count} revenue={stats.thisMonth.revenue} />
      </div>

      <section className="mb-6 bg-white border border-[#e6e1d6] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-dark">Revenue — last 14 days</h3>
          <span className="text-xs text-ink-muted">
            £{stats.trend.reduce((s, t) => s + t.revenue, 0).toFixed(2)} total
          </span>
        </div>
        <div className="flex items-end gap-1.5 h-36">
          {stats.trend.map((t, i) => {
            const height = Math.max(4, Math.round((t.revenue / stats.trendPeak) * 100));
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end gap-1.5 group"
                title={`${t.day} — £${t.revenue.toFixed(2)}`}
              >
                <div
                  className={`w-full rounded-t-md transition-colors ${
                    t.revenue > 0 ? "bg-brand/80 group-hover:bg-brand" : "bg-[#f0ede4]"
                  }`}
                  style={{ height: `${height}%` }}
                />
                {i % 2 === 0 || i === stats.trend.length - 1 ? (
                  <span className="text-[10px] text-ink-muted">{t.day}</span>
                ) : (
                  <span className="text-[10px] text-transparent select-none">·</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mb-6 bg-white border border-[#e6e1d6] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-dark">New customers — last 14 days</h3>
          <span className="text-xs text-ink-muted">
            {stats.newCustomersToday} today · {stats.newCustomersWeek} this week · {stats.newCustomersMonth} this month
          </span>
        </div>
        <div className="flex items-end gap-1.5 h-24">
          {stats.customerTrend.map((t, i) => {
            const height = Math.max(4, Math.round((t.count / stats.customerPeak) * 100));
            return (
              <div
                key={i}
                className="flex-1 flex flex-col items-center justify-end gap-1.5 group"
                title={`${t.day} — ${t.count} new`}
              >
                <div
                  className={`w-full rounded-t-md transition-colors ${
                    t.count > 0 ? "bg-green/70 group-hover:bg-green" : "bg-[#f0ede4]"
                  }`}
                  style={{ height: `${height}%` }}
                />
                {i % 3 === 0 || i === stats.customerTrend.length - 1 ? (
                  <span className="text-[10px] text-ink-muted">{t.day}</span>
                ) : (
                  <span className="text-[10px] text-transparent select-none">·</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        <section className="bg-white border border-[#e6e1d6] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark">Order status</h3>
            <Link href="/admin/orders" className="text-xs text-brand hover:underline">View all</Link>
          </div>
          {Object.keys(stats.statusCounts).length === 0 ? (
            <p className="text-sm text-ink-muted">No orders yet.</p>
          ) : (
            <ul className="space-y-2.5">
              {Object.entries(stats.statusCounts)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between">
                    <StatusBadge status={status} />
                    <span className="text-sm font-medium text-dark">{count}</span>
                  </li>
                ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 bg-white border border-[#e6e1d6] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gold" />
            <h3 className="text-sm font-semibold text-dark">Top selling products — last 30 days</h3>
          </div>
          <Link href="/admin/products" className="text-xs text-brand hover:underline">View all</Link>
        </div>
        {stats.topProducts.length === 0 ? (
          <p className="text-sm text-ink-muted">No sales yet — your bestsellers will show here.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ink-muted text-xs">
                <th className="pb-2 font-medium">Product</th>
                <th className="pb-2 font-medium text-right">Units sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e6e1d6]/50">
              {stats.topProducts.map((p) => (
                <tr key={p.name}>
                  <td className="py-2.5 text-dark font-medium">
                    <span className="mr-2">{p.emoji}</span>{p.name}
                  </td>
                  <td className="py-2.5 text-right text-dark">{p.qty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

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
    Refunded: "text-purple-700 bg-purple-50",
    "Ready for pickup": "text-teal-700 bg-teal-50",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${colors[status] ?? "text-ink-muted bg-[#f4f1ea]"}`}>
      {status}
    </span>
  );
}
