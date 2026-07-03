import { createServerSupabase } from "@/lib/supabase/server";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

async function getStats() {
  const supabase = await createServerSupabase();

  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  const { count: customerCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const recentOrdersRaw = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);
  const recentOrders = (recentOrdersRaw.data ?? []) as { id: string; status: string; total: number }[];

  const lowStockRaw = await supabase
    .from("products")
    .select("*")
    .lte("stock", 10)
    .order("stock")
    .limit(5);
  const lowStock = (lowStockRaw.data ?? []) as { id: string; emoji: string; name: string; stock: number }[];

  const revenueDataRaw = await supabase
    .from("orders")
    .select("total")
    .eq("status", "Delivered");
  const revenueData = (revenueDataRaw.data ?? []) as { total: number }[];

  const revenue = revenueData?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;

  return {
    productCount: productCount ?? 0,
    orderCount: orderCount ?? 0,
    customerCount: customerCount ?? 0,
    revenue,
    recentOrders: recentOrders ?? [],
    lowStock: lowStock ?? [],
  };
}

export default async function AdminDashboard() {
  const stats = await getStats();

  return (
    <div>
      <h2 className="text-lg font-semibold text-dark mb-6">Dashboard</h2>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card icon={TrendingUp} label="Revenue" value={`£${stats.revenue.toFixed(2)}`} />
        <Card icon={ShoppingCart} label="Orders" value={String(stats.orderCount)} />
        <Card icon={Package} label="Products" value={String(stats.productCount)} />
        <Card icon={Users} label="Customers" value={String(stats.customerCount)} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <section className="bg-white border border-[#e6e1d6] rounded-xl p-5">
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
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6e1d6]/50">
                {stats.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-2.5 text-dark font-medium">{o.id}</td>
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

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Delivered: "text-green bg-green/10",
    "Out for delivery": "text-blue bg-blue/10",
    Preparing: "text-amber bg-amber/10",
    Cancelled: "text-red bg-red/10",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] ?? "text-ink-muted bg-[#f4f1ea]"}`}>
      {status}
    </span>
  );
}
