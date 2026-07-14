import Link from "next/link";
import { Package } from "lucide-react";
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

export default async function AccountPage() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profileRaw } = await supabase.from("profiles").select("*").eq("id", user!.id).single();

  const { data: ordersRaw } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const profile = profileRaw as { name: string } | null;
  const orders = (ordersRaw ?? []) as {
    id: string;
    total: number;
    address: Record<string, string>;
    status: string;
    created_at: string;
  }[];

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
      <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">My account</p>
      <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">
        Hello, {profile?.name ?? user!.email}
      </h1>
      <p className="mt-2 text-ink-soft text-sm">{user!.email}</p>

      <div className="mt-10 grid lg:grid-cols-[240px_1fr] gap-10">
        <AccountSidebar />

        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-dark">Recent orders</h2>
            {orders.length > 0 && (
              <Link href="/account/orders" className="text-sm font-medium text-dark hover:text-brand">
                View all →
              </Link>
            )}
          </div>

          <ul className="divide-y divide-line border-y border-line">
            {orders.length === 0 ? (
              <li className="py-12 text-center">
                <p className="text-ink-muted text-sm mb-4">No orders yet.</p>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors"
                >
                  Start shopping
                </Link>
              </li>
            ) : (
              orders.map((o) => {
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
              })
            )}
          </ul>

          <div className="mt-10 grid sm:grid-cols-2 gap-5">
            <Card title="Delivery address" subtitle="Manage your delivery addresses" cta="Manage addresses" href="/account/addresses" />
            <Card title="Payment method" subtitle="Manage your payment methods" cta="Manage payment" href="/account/payment" />
          </div>
        </section>
      </div>
    </div>
  );
}

function Card({ title, subtitle, cta, href }: { title: string; subtitle: string; cta: string; href: string }) {
  return (
    <div className="border border-line rounded-2xl p-5">
      <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted mb-2">{title}</p>
      <p className="text-dark font-medium">{subtitle}</p>
      <Link href={href} className="mt-4 inline-block text-sm font-semibold text-dark hover:text-brand">
        {cta} →
      </Link>
    </div>
  );
}
