import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Package, Truck, Check, XCircle, MapPin, ExternalLink } from "lucide-react";
import { createServerSupabase } from "@/lib/supabase/server";
import { trackingUrl } from "@/lib/couriers";
import ReorderButton from "./ReorderButton";

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

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user!.id)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", id);

  const productIds = new Set((items ?? []).map((i: { product_id: string }) => i.product_id));
  const { data: products } = await supabase
    .from("products")
    .select("id, name, emoji, bg_color, price, weight, category_id, categories!inner(name)")
    .in("id", [...productIds]);

  type ProductRow = { id: string; name: string; emoji: string; bg_color: string; price: number; weight: string; category_id: string; categories: { name: string } };
  type ItemRow = { product_id: string; qty: number; unit_price: number };

  const items2 = (items ?? []) as ItemRow[];
  const products2 = (products ?? []) as ProductRow[];
  const productMap = new Map(products2.map((p) => [p.id, p]));

  const lines = items2.map((i) => {
    const p = productMap.get(i.product_id);
    return {
      productId: i.product_id,
      qty: i.qty,
      product: p
        ? {
            id: p.id,
            name: p.name,
            category: (p.categories as { name: string }).name,
            emoji: p.emoji,
            bg_color: p.bg_color,
            price: Number(i.unit_price),
            weight: p.weight,
          }
        : null,
    };
  }).filter((l) => l.product !== null) as {
    productId: string;
    qty: number;
    product: { id: string; name: string; category: string; emoji: string; bg_color: string; price: number; weight: string };
  }[];

  const total = Number(order.total);
  const address = order.address as { name?: string; line1?: string; city?: string; postcode?: string; country?: string };
  const status = order.status as string;

  // Tracking: use the courier tracking number the admin set, else a friendly internal ref
  const courier = (order.courier as string | null) ?? null;
  const trackingNumber = (order.tracking_number as string | null) ?? null;
  const parcelUrl = trackingUrl(courier, trackingNumber);
  const trackingRef =
    trackingNumber ?? "AFM-" + order.id.replace(/-/g, "").slice(0, 10).toUpperCase();

  const placedDate = new Date(order.created_at);
  // Prefer the admin-set estimated delivery date; otherwise fall back to +2 days
  const estDelivery = order.estimated_delivery
    ? new Date(order.estimated_delivery as string)
    : (() => {
        const d = new Date(placedDate);
        d.setDate(d.getDate() + 2);
        return d;
      })();
  const estDeliveryLabel = estDelivery.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  const stepDone = {
    placed: true,
    preparing: status === "Preparing" || status === "Out for delivery" || status === "Delivered",
    dispatched: status === "Out for delivery" || status === "Delivered",
    delivered: status === "Delivered",
  };
  // Index of the current active step for the progress line
  const activeStep = status === "Delivered" ? 3 : status === "Out for delivery" ? 2 : 1;

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
      <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8 flex-wrap">
        <Link href="/" className="hover:text-dark">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/account" className="hover:text-dark">Account</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/account/orders" className="hover:text-dark">Orders</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-dark">{order.id}</span>
      </nav>

      <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
        <div>
          <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Order details</p>
          <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">{order.id}</h1>
          <p className="mt-2 text-ink-soft text-sm">
            Placed on{" "}
            {new Date(order.created_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${statusColor(status)}`}>
          {status}
        </span>
      </div>

      {status === "Cancelled" ? (
        <div className="border border-red-200 bg-red-50 rounded-2xl p-6 mb-10 flex items-center gap-4">
          <XCircle className="w-6 h-6 text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-dark">This order has been cancelled</p>
            <p className="text-sm text-ink-soft mt-1">
              If you have any questions, please contact support.
            </p>
          </div>
        </div>
      ) : (
        <div className="border border-line rounded-2xl overflow-hidden mb-10">
          {/* Tracking header */}
          <div className="bg-surface px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-line">
            <div className="flex items-center gap-2 flex-wrap">
              <MapPin className="w-4 h-4 text-dark shrink-0" />
              <span className="text-sm text-ink-soft">
                {courier ? `${courier} tracking` : "Tracking reference"}
              </span>
              <span className="text-sm font-semibold text-dark font-mono">{trackingRef}</span>
              {parcelUrl && (
                <a
                  href={parcelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  Track parcel <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <div className="text-sm">
              <span className="text-ink-soft">
                {status === "Delivered" ? "Delivered" : "Estimated delivery"}:{" "}
              </span>
              <span className="font-semibold text-dark">
                {status === "Delivered" ? "Completed" : estDeliveryLabel}
              </span>
            </div>
          </div>

          {/* 4-step timeline */}
          <div className="p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-2">
              <Step
                icon={<Check className="w-4 h-4" />}
                title="Order placed"
                date={placedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                done={stepDone.placed}
              />
              <Step
                icon={<Package className="w-4 h-4" />}
                title="Preparing"
                date={stepDone.preparing ? "In progress" : "Pending"}
                done={stepDone.preparing}
                active={activeStep === 1}
              />
              <Step
                icon={<Truck className="w-4 h-4" />}
                title="Out for delivery"
                date={stepDone.dispatched ? "On its way" : "Pending"}
                done={stepDone.dispatched}
                active={activeStep === 2}
              />
              <Step
                icon={<Check className="w-4 h-4" />}
                title="Delivered"
                date={stepDone.delivered ? "Completed" : estDeliveryLabel}
                done={stepDone.delivered}
                active={activeStep === 3}
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_360px] gap-10">
        <section>
          <h2 className="text-lg font-semibold text-dark mb-5">Items ({lines.length})</h2>
          <ul className="divide-y divide-line border-y border-line">
            {lines.map(({ product, qty }) => (
              <li key={product.id} className="py-5 flex gap-4">
                <Link
                  href={`/shop/${product.id}`}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shrink-0"
                  style={{ backgroundColor: product.bg_color }}
                >
                  {product.emoji}
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted">{product.category}</p>
                  <Link href={`/shop/${product.id}`} className="font-medium text-dark hover:text-brand">
                    {product.name}
                  </Link>
                  <p className="text-xs text-ink-muted mt-1">{product.weight} · qty {qty}</p>
                </div>
                <p className="font-semibold text-dark">£{(product.price * qty).toFixed(2)}</p>
              </li>
            ))}
          </ul>

          <ReorderButton items={items2} />
        </section>

        <aside className="space-y-6">
          <div className="border border-line rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-dark mb-4">Summary</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Subtotal</dt>
                <dd className="text-dark">£{Number(order.subtotal).toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Delivery</dt>
                <dd className="text-dark">{order.delivery === 0 ? "Free" : `£${Number(order.delivery).toFixed(2)}`}</dd>
              </div>
              <div className="flex justify-between pt-3 border-t border-line">
                <dt className="text-dark font-semibold">Total</dt>
                <dd className="text-dark font-semibold text-lg">£{total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          <div className="border border-line rounded-2xl p-6">
            <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted mb-3">Delivered to</p>
            <p className="text-dark font-medium">{address.name}</p>
            <p className="text-sm text-ink-soft mt-1">{address.line1}</p>
            <p className="text-sm text-ink-soft">
              {address.city}, {address.postcode}
            </p>
            <p className="text-sm text-ink-soft">{address.country}</p>
          </div>

          <Link href="/account/orders" className="block text-sm font-semibold text-dark hover:text-brand">
            ← All orders
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Step({
  icon,
  title,
  date,
  done,
  active,
}: {
  icon: React.ReactNode;
  title: string;
  date: string;
  done?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex sm:flex-col items-start sm:items-center gap-3 sm:text-center">
      <div
        className={
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors " +
          (done
            ? "bg-green text-white"
            : active
              ? "bg-brand text-white ring-4 ring-brand/15 animate-pulse"
              : "bg-surface text-ink-muted")
        }
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-dark">{title}</p>
        <p className={"text-xs " + (active && !done ? "text-brand font-medium" : "text-ink-muted")}>
          {date}
        </p>
      </div>
    </div>
  );
}
