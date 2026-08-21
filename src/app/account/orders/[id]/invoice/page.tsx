import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServerUser } from "@/lib/auth";
import PrintInvoiceButton from "./PrintInvoiceButton";

export default async function OrderInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getServerUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!order) notFound();

  const { data: items } = await admin
    .from("order_items")
    .select("product_id, qty, unit_price, weight")
    .eq("order_id", id);
  const productIds = [...new Set((items ?? []).map((item) => item.product_id))];
  const { data: products } = productIds.length > 0
    ? await admin.from("products").select("id, name, emoji").in("id", productIds)
    : { data: [] };
  const productMap = new Map((products ?? []).map((product) => [product.id, product]));
  const address = (order.address ?? {}) as { name?: string; email?: string; phone?: string; address1?: string; address2?: string; city?: string; postcode?: string; country?: string };
  const trackingNumber = order.tracking_number ?? `AFM-${order.id.replace(/-/g, "").slice(0, 10).toUpperCase()}`;
  const placedAt = new Date(order.created_at);

  return (
    <main className="min-h-screen bg-[#f7f6f2] px-4 py-8 sm:px-6 lg:py-12 print:bg-white print:px-0 print:py-0">
      <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-white p-6 shadow-sm sm:p-10 print:max-w-none print:rounded-none print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-start justify-between gap-6 border-b border-line pb-8">
          <div>
            <p className="text-xl font-bold tracking-tight text-dark">AfroMart</p>
            <p className="mt-1 text-sm text-ink-muted">Order invoice</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-ink-muted">Invoice</p>
            <p className="mt-1 font-mono text-sm font-semibold text-dark">{order.id}</p>
            <p className="mt-1 text-xs text-ink-muted">
              {placedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-ink-muted">Billed to</p>
            <p className="mt-2 text-sm font-semibold text-dark">{address.name ?? "Customer"}</p>
            {address.email && <p className="text-sm text-ink-soft">{address.email}</p>}
            {address.phone && <p className="text-sm text-ink-soft">{address.phone}</p>}
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] uppercase tracking-wider text-ink-muted">Delivered to</p>
            <p className="mt-2 text-sm text-ink-soft">{address.address1}</p>
            {address.address2 && <p className="text-sm text-ink-soft">{address.address2}</p>}
            <p className="text-sm text-ink-soft">{address.city}, {address.postcode}</p>
            <p className="text-sm text-ink-soft">{address.country}</p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 rounded-xl bg-surface p-4 sm:grid-cols-3">
          <div><p className="text-[11px] uppercase tracking-wider text-ink-muted">Payment status</p><p className="mt-1 text-sm font-semibold text-green">Paid</p></div>
          <div><p className="text-[11px] uppercase tracking-wider text-ink-muted">Order status</p><p className="mt-1 text-sm font-semibold text-dark">{order.status}</p></div>
          <div><p className="text-[11px] uppercase tracking-wider text-ink-muted">Tracking reference</p><p className="mt-1 font-mono text-sm font-semibold text-dark">{trackingNumber}</p></div>
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-muted">
              <th className="pb-3 font-medium">Item</th>
              <th className="pb-3 text-center font-medium">Qty</th>
              <th className="pb-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {(items ?? []).map((item) => {
              const product = productMap.get(item.product_id);
              return (
                <tr key={`${item.product_id}-${item.weight}`}>
                  <td className="py-4 text-dark"><span className="mr-2">{product?.emoji}</span>{product?.name ?? "Product"}<span className="block text-xs text-ink-muted">{item.weight}</span></td>
                  <td className="py-4 text-center text-ink-soft">{item.qty}</td>
                  <td className="py-4 text-right font-medium text-dark">£{(Number(item.unit_price) * item.qty).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="ml-auto mt-6 max-w-xs space-y-3 text-sm">
          <div className="flex justify-between text-ink-soft"><span>Subtotal</span><span>£{Number(order.subtotal).toFixed(2)}</span></div>
          {Number(order.discount) > 0 && <div className="flex justify-between text-green"><span>Discount</span><span>−£{Number(order.discount).toFixed(2)}</span></div>}
          {Number(order.gift_card_used) > 0 && <div className="flex justify-between text-green"><span>Gift card</span><span>−£{Number(order.gift_card_used).toFixed(2)}</span></div>}
          <div className="flex justify-between text-ink-soft"><span>Delivery</span><span>{Number(order.delivery) === 0 ? "Free" : `£${Number(order.delivery).toFixed(2)}`}</span></div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold text-dark"><span>Total paid</span><span>£{Number(order.total).toFixed(2)}</span></div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6 print:hidden">
          <Link href={`/account/orders/${order.id}`} className="text-sm font-semibold text-dark hover:text-brand">← Back to order</Link>
          <PrintInvoiceButton />
        </div>
        <p className="mt-8 text-center text-xs text-ink-muted">Thank you for shopping with AfroMart.</p>
      </div>
    </main>
  );
}
