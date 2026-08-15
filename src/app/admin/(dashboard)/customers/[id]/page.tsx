import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Mail, MapPin, Phone, ShoppingCart, User } from "lucide-react";

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  currency: string | null;
  created_at: string;
};

type Order = {
  id: string;
  status: string;
  subtotal: number;
  delivery: number;
  total: number;
  created_at: string;
  address: Record<string, string> | null;
  courier: string | null;
  tracking_number: string | null;
};

type Address = {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  country: string;
  is_default: boolean;
};

type OrderItem = {
  order_id: string;
  qty: number;
  unit_price: number;
  weight: string;
  products: { name: string; emoji: string } | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-[#e6e1d6] rounded-xl p-5">
      <p className="text-2xl font-semibold text-dark">{value}</p>
      <p className="text-xs text-ink-muted mt-1">{label}</p>
    </div>
  );
}

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const profileRaw = await supabase
    .from("profiles")
    .select("id, name, email, phone, currency, created_at")
    .eq("id", id)
    .single();
  const profile = profileRaw.data as Profile | null;

  if (!profile) {
    return <p className="text-sm text-ink-muted">Customer not found.</p>;
  }

  const [ordersRaw, addressesRaw] = await Promise.all([
    supabase
      .from("orders")
      .select("id, status, subtotal, delivery, total, created_at, address, courier, tracking_number")
      .eq("user_id", id)
      .order("created_at", { ascending: false }),
    supabase.from("addresses").select("*").eq("user_id", id).order("is_default", { ascending: false }),
  ]);

  const orders = (ordersRaw.data ?? []) as Order[];
  const addresses = (addressesRaw.data ?? []) as Address[];

  const itemsByOrder = new Map<string, OrderItem[]>();
  if (orders.length > 0) {
    const orderIds = orders.map((o) => o.id);
    const itemsRaw = await supabase
      .from("order_items")
      .select("order_id, qty, unit_price, weight, products(name, emoji)")
      .in("order_id", orderIds)
      .order("created_at", { ascending: true });
    for (const item of (itemsRaw.data ?? []) as OrderItem[]) {
      const list = itemsByOrder.get(item.order_id) ?? [];
      list.push(item);
      itemsByOrder.set(item.order_id, list);
    }
  }

  const paidOrders = orders.filter((o) => o.status !== "Cancelled");
  const totalSpent = paidOrders.reduce((s, o) => s + Number(o.total), 0);
  const avgOrder = paidOrders.length > 0 ? totalSpent / paidOrders.length : 0;
  const lastOrder = orders[0];

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/customers" className="text-xs text-brand hover:underline">
          ← Back to customers
        </Link>
        <div className="flex items-center gap-4 mt-3">
          <div className="w-14 h-14 rounded-full bg-[#f4f1ea] border border-[#e6e1d6] flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-ink-muted" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-dark">
              {profile.name ?? "Unnamed customer"}
            </h2>
            <div className="flex items-center gap-4 mt-1 text-sm text-ink-soft flex-wrap">
              {profile.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> {profile.email}
                </span>
              )}
              {profile.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {profile.phone}
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Joined {formatDate(profile.created_at)}
              {profile.currency ? ` · ${profile.currency}` : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Stat label="Orders" value={String(orders.length)} />
        <Stat label="Total spent" value={`£${totalSpent.toFixed(2)}`} />
        <Stat label="Avg order" value={`£${avgOrder.toFixed(2)}`} />
        <Stat label="Last order" value={lastOrder ? formatDate(lastOrder.created_at) : "—"} />
      </div>

      {addresses.length > 0 && (
        <section className="mb-6 bg-white border border-[#e6e1d6] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-ink-muted" />
            <h3 className="text-sm font-semibold text-dark">Saved addresses</h3>
            {addresses.some((a) => a.is_default) && (
              <span className="text-xs text-ink-muted">· default marked</span>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {addresses.map((a) => (
              <div
                key={a.id}
                className="border border-[#e6e1d6] rounded-lg p-4 text-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-dark">{a.label || a.name}</span>
                  {a.is_default && (
                    <span className="text-[10px] font-semibold text-green bg-green/10 px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-ink-soft leading-relaxed">
                  {a.line1}
                  {a.line2 ? `, ${a.line2}` : ""}
                  <br />
                  {a.city}, {a.postcode}
                  <br />
                  {a.country}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-ink-muted" />
            <h3 className="text-sm font-semibold text-dark">Order history</h3>
            {orders.length > 0 && (
              <span className="text-xs text-ink-muted">{orders.length} total</span>
            )}
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted text-xs border-b border-[#e6e1d6]">
              <th className="py-3 px-5 font-medium">Order</th>
              <th className="py-3 px-5 font-medium">Items</th>
              <th className="py-3 px-5 font-medium">Status</th>
              <th className="py-3 px-5 font-medium">Date</th>
              <th className="py-3 px-5 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e1d6]/50">
            {orders.map((o) => {
              const items = itemsByOrder.get(o.id) ?? [];
              const itemSummary =
                items.length > 0
                  ? items
                      .map((i) => `${i.qty}× ${i.products?.name ?? "Item"}`)
                      .join(", ")
                  : "—";
              return (
                <tr key={o.id} className="hover:bg-[#fafaf7]">
                  <td className="py-3 px-5 font-medium text-dark">
                    <Link href={`/admin/orders/${o.id}`} className="hover:text-brand">
                      {o.id}
                    </Link>
                  </td>
                  <td className="py-3 px-5 text-ink-soft max-w-[280px] truncate">
                    {itemSummary}
                  </td>
                  <td className="py-3 px-5">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="py-3 px-5 text-ink-soft">{formatDate(o.created_at)}</td>
                  <td className="py-3 px-5 text-right text-dark">£{Number(o.total).toFixed(2)}</td>
                </tr>
              );
            })}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-ink-muted">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
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
