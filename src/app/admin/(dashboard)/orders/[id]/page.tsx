"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { COURIERS, trackingUrl } from "@/lib/couriers";
import { useToast } from "@/components/ui/ToastProvider";

type OrderItem = {
  id: string;
  product_id: string;
  qty: number;
  unit_price: number;
};

type Order = {
  id: string;
  status: string;
  subtotal: number;
  delivery: number;
  total: number;
  address: Record<string, unknown>;
  courier: string | null;
  tracking_number: string | null;
  estimated_delivery: string | null;
  payment_intent: string | null;
  created_at: string;
  user_id: string | null;
  items: OrderItem[];
};

type Customer = {
  name: string | null;
  email: string | null;
  phone: string | null;
} | null;

type OrderEvent = {
  id: string;
  event: string;
  message: string | null;
  actor: string | null;
  created_at: string;
};

const STATUSES = ["Preparing", "Out for delivery", "Delivered", "Cancelled", "Refunded"];

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [customer, setCustomer] = useState<Customer>(null);
  const [products, setProducts] = useState<Record<string, { name: string; emoji: string }>>({});
  const [events, setEvents] = useState<OrderEvent[]>([]);
  const [status, setStatus] = useState("");
  const [courier, setCourier] = useState("");
  const [tracking, setTracking] = useState("");
  const [estDelivery, setEstDelivery] = useState("");
  const [addr, setAddr] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmRefund, setConfirmRefund] = useState(false);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/admin/orders/${params.id as string}`);
      const data = await res.json();
      const o = data.order as (Record<string, unknown> & { items: OrderItem[] }) | null;
      if (!o) return;
      setOrder(o as Order);
      setProducts(data.products ?? {});
      setCustomer(data.customer ?? null);
      setEvents(data.events ?? []);
      setStatus(o.status as string);
      setCourier((o.courier as string) ?? "");
      setTracking((o.tracking_number as string) ?? "");
      setEstDelivery((o.estimated_delivery as string) ?? "");
      setAddr((o.address as Record<string, string>) ?? {});
    }
    load();
  }, [params.id]);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${params.id as string}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        courier: courier || null,
        tracking_number: tracking.trim() || null,
        estimated_delivery: estDelivery || null,
        address: {
          name: addr.name,
          email: addr.email,
          phone: addr.phone,
          address1: addr.address1,
          address2: addr.address2,
          city: addr.city,
          postcode: addr.postcode,
          country: addr.country,
        },
      }),
    });
    setSaving(false);
    if (!res.ok) {
      const data = await res.json();
      toast(data.error ?? "Could not save changes.", "error");
    } else {
      toast("Changes saved.");
      router.refresh();
    }
  }

  async function handleRefund() {
    setRefunding(true);
    const res = await fetch(`/api/admin/orders/${params.id as string}/refund`, { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setRefunding(false);
    setConfirmRefund(false);
    if (!res.ok) {
      toast(data.error ?? "Refund failed.", "error");
      return;
    }
    toast("Refund issued via Stripe.");
    router.refresh();
  }

  if (!order) return <p className="text-sm text-ink-muted">Loading...</p>;

  const address = addr;
  const liveTrackingUrl = trackingUrl(courier || null, tracking || null);
  const refundable =
    !!order.payment_intent && !["Refunded", "Cancelled"].includes(order.status);

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-dark">{order.id}</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            {new Date(order.created_at).toLocaleDateString("en-GB", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
        {refundable && (
          <button
            onClick={() => setConfirmRefund(true)}
            className="h-9 px-4 rounded-full border border-red/30 text-red text-xs font-semibold hover:bg-red hover:text-white transition-colors"
          >
            Refund order
          </button>
        )}
      </div>

      {/* Fulfilment: status + tracking */}
      <div className="bg-white border border-[#e6e1d6] rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Fulfilment &amp; tracking</h3>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-5 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-xs text-ink-soft mb-1.5">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-9 px-3 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs text-ink-soft mb-1.5">Estimated delivery</span>
            <input
              type="date"
              value={estDelivery}
              onChange={(e) => setEstDelivery(e.target.value)}
              className="w-full h-9 px-3 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white"
            />
          </label>

          <label className="block">
            <span className="block text-xs text-ink-soft mb-1.5">Courier</span>
            <select
              value={courier}
              onChange={(e) => setCourier(e.target.value)}
              className="w-full h-9 px-3 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white"
            >
              <option value="">— Not dispatched —</option>
              {COURIERS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="block text-xs text-ink-soft mb-1.5">Tracking number</span>
            <input
              type="text"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="e.g. AB123456789GB"
              className="w-full h-9 px-3 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white font-mono"
            />
          </label>
        </div>

        {liveTrackingUrl && (
          <a
            href={liveTrackingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline"
          >
            Open on {courier} →
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-[#e6e1d6] rounded-xl p-5">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">Customer</h3>
          {customer ? (
            <>
              <p className="text-sm text-dark font-medium">{customer.name ?? "—"}</p>
              <p className="text-sm text-ink-soft mt-1">{customer.email ?? "—"}</p>
              {customer.phone && (
                <p className="text-sm text-ink-soft mt-0.5">{customer.phone}</p>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-muted">Guest order — no account linked.</p>
          )}
        </div>

        <div className="bg-white border border-[#e6e1d6] rounded-xl p-5">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">Delivery details</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="block text-xs text-ink-soft mb-1">Name</span>
                <input value={address.name ?? ""} onChange={(e) => setAddr({ ...addr, name: e.target.value })}
                  className="w-full h-8 px-2.5 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white focus:outline-none focus:border-dark" />
              </label>
              <label className="block">
                <span className="block text-xs text-ink-soft mb-1">Phone</span>
                <input value={address.phone ?? ""} onChange={(e) => setAddr({ ...addr, phone: e.target.value })}
                  className="w-full h-8 px-2.5 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white focus:outline-none focus:border-dark" />
              </label>
            </div>
            <label className="block">
              <span className="block text-xs text-ink-soft mb-1">Email</span>
              <input type="email" value={address.email ?? ""} onChange={(e) => setAddr({ ...addr, email: e.target.value })}
                className="w-full h-8 px-2.5 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white focus:outline-none focus:border-dark" />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-soft mb-1">Address line 1</span>
              <input value={address.address1 ?? ""} onChange={(e) => setAddr({ ...addr, address1: e.target.value })}
                className="w-full h-8 px-2.5 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white focus:outline-none focus:border-dark" />
            </label>
            <label className="block">
              <span className="block text-xs text-ink-soft mb-1">Address line 2</span>
              <input value={address.address2 ?? ""} onChange={(e) => setAddr({ ...addr, address2: e.target.value })}
                className="w-full h-8 px-2.5 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white focus:outline-none focus:border-dark" />
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="block text-xs text-ink-soft mb-1">City</span>
                <input value={address.city ?? ""} onChange={(e) => setAddr({ ...addr, city: e.target.value })}
                  className="w-full h-8 px-2.5 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white focus:outline-none focus:border-dark" />
              </label>
              <label className="block">
                <span className="block text-xs text-ink-soft mb-1">Postcode</span>
                <input value={address.postcode ?? ""} onChange={(e) => setAddr({ ...addr, postcode: e.target.value })}
                  className="w-full h-8 px-2.5 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white focus:outline-none focus:border-dark" />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-[#e6e1d6]">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Order summary</h3>
        </div>
        <div className="px-5 py-3 space-y-1.5 text-sm">
          <div className="flex justify-between text-ink-soft">
            <span>Subtotal</span>
            <span>£{Number(order.subtotal).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-ink-soft">
            <span>Delivery</span>
            <span>{order.delivery === 0 ? "Free" : `£${Number(order.delivery).toFixed(2)}`}</span>
          </div>
          <div className="flex justify-between text-dark font-semibold pt-1.5 border-t border-[#e6e1d6]">
            <span>Total</span>
            <span>£{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-[#e6e1d6]">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider">Order history</h3>
        </div>
        {events.length === 0 ? (
          <p className="px-5 py-4 text-sm text-ink-muted">No events recorded yet.</p>
        ) : (
          <ul className="divide-y divide-[#e6e1d6]/50">
            {events.map((ev) => (
              <li key={ev.id} className="px-5 py-3 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-dark font-medium">{ev.message ?? ev.event}</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {ev.actor && ev.actor !== "system" ? ev.actor : "System"} · {new Date(ev.created_at).toLocaleString()}
                  </p>
                </div>
                <EventBadge event={ev.event} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted text-xs border-b border-[#e6e1d6]">
              <th className="py-3 px-4 font-medium">Item</th>
              <th className="py-3 px-4 font-medium">Qty</th>
              <th className="py-3 px-4 font-medium text-right">Price</th>
              <th className="py-3 px-4 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e1d6]/50">
            {order.items.map((item) => {
              const product = products[item.product_id];
              return (
                <tr key={item.id}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{product?.emoji ?? "📦"}</span>
                      <span className="text-dark">{product?.name ?? item.product_id}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-ink-soft">{item.qty}</td>
                  <td className="py-3 px-4 text-right text-ink-soft">£{Number(item.unit_price).toFixed(2)}</td>
                  <td className="py-3 px-4 text-right text-dark font-medium">
                    £{(item.qty * Number(item.unit_price)).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Refund confirmation */}
      {confirmRefund && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmRefund(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-dark mb-2">Refund this order?</h3>
            <p className="text-sm text-ink-soft mb-6">
              {`£${Number(order.total).toFixed(2)} will be returned to the customer via Stripe. The order status will be set to Refunded.`}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmRefund(false)}
                disabled={refunding}
                className="h-9 px-4 rounded-full border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-[#f4f1ea] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                disabled={refunding}
                className="h-9 px-4 rounded-full bg-red text-white text-xs font-semibold hover:bg-red/90 transition-colors disabled:opacity-50"
              >
                {refunding ? "Refunding…" : "Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EventBadge({ event }: { event: string }) {
  const colors: Record<string, string> = {
    created: "bg-[#f4f1ea] text-ink-soft",
    payment_confirmed: "bg-green/10 text-green",
    dispatched: "bg-blue-50 text-blue-700",
    status_changed: "bg-amber-50 text-amber-700",
    refunded: "bg-purple-50 text-purple-700",
    cancelled: "bg-red-50 text-red-600",
    address_updated: "bg-[#f4f1ea] text-ink-soft",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${colors[event] ?? "bg-[#f4f1ea] text-ink-soft"}`}>
      {event.replace(/_/g, " ")}
    </span>
  );
}
