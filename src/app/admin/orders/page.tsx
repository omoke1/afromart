import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminOrdersPage() {
  const supabase = await createServerSupabase();

  const ordersRaw = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  const orders = (ordersRaw.data ?? []) as { id: string; address: Record<string, unknown> | null; created_at: string; status: string; total: number }[];

  return (
    <div>
      <h2 className="text-lg font-semibold text-dark mb-6">Orders</h2>

      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted text-xs border-b border-[#e6e1d6]">
              <th className="py-3 px-4 font-medium">Order</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Customer</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Total</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e1d6]/50">
            {orders?.map((o) => {
              const address = o.address as { name?: string } | null;
              return (
                <tr key={o.id} className="hover:bg-[#fafaf7]">
                  <td className="py-3 px-4 font-medium text-dark">{o.id}</td>
                  <td className="py-3 px-4 text-ink-soft">
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-ink-soft">
                    {address?.name ?? "—"}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-3 px-4 text-right text-dark font-medium">
                    £{Number(o.total).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="text-xs text-ink-soft hover:text-dark"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {!orders?.length && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-ink-muted">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
