import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import AccountSidebar from "@/components/layout/AccountSidebar";
import { createServerSupabase } from "@/lib/supabase/server";

function statusColor(status: string) {
  switch (status) {
    case "Preparing":
      return "text-amber-700 bg-amber-50";
    case "Out for delivery":
      return "text-blue-700 bg-blue-50";
    case "Delivered":
      return "text-green bg-green/10";
    case "Cancelled":
      return "text-red-600 bg-red-50";
    default:
      return "text-ink-muted bg-surface";
  }
}

export default async function OrdersPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: ordersRaw } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const orders = (ordersRaw ?? []) as {
    id: string;
    total: number;
    status: string;
    created_at: string;
  }[];

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
      <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8 flex-wrap">
        <Link href="/" className="hover:text-dark">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/account" className="hover:text-dark">Account</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-dark">Orders</span>
      </nav>

      <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Account</p>
      <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">Orders</h1>

      <div className="mt-10 grid lg:grid-cols-[240px_1fr] gap-10">
        <AccountSidebar />

        <section>
          {orders.length === 0 ? (
            <div className="border border-line rounded-3xl py-20 text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-surface flex items-center justify-center mb-4">
                <Package className="w-7 h-7 text-ink-muted" />
              </div>
              <p className="text-dark font-medium">No orders yet.</p>
              <p className="text-ink-muted text-sm mt-2 mb-6">
                Start shopping to see your orders here.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors"
              >
                Browse the shop
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {orders.map((o) => {
                const total = Number(o.total);
                return (
                  <li key={o.id} className="py-5 flex items-center gap-4 flex-wrap sm:flex-nowrap">
                    <div className="w-12 h-12 rounded-xl bg-surface flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-dark" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-dark">{o.id}</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {new Date(o.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusColor(o.status)}`}>
                      {o.status}
                    </span>
                    <p className="font-semibold text-dark w-20 text-right">£{total.toFixed(2)}</p>
                    <Link
                      href={`/account/orders/${o.id}`}
                      className="text-sm font-medium text-dark hover:text-brand shrink-0"
                    >
                      Details →
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
