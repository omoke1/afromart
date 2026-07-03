"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  created_at: string;
  items: OrderItem[];
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [products, setProducts] = useState<Record<string, { name: string; emoji: string }>>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const oRaw = await supabase.from("orders").select("*").eq("id", params.id as string).single();
      const o = oRaw.data as Record<string, unknown> | null;
      if (!o) return;
      const iRaw = await supabase.from("order_items").select("*").eq("order_id", params.id as string);
      const items = (iRaw.data ?? []) as OrderItem[];
      const pRaw = await supabase.from("products").select("id, name, emoji");
      const allProducts = (pRaw.data ?? []) as { id: string; name: string; emoji: string }[];
      const productMap: Record<string, { name: string; emoji: string }> = {};
      for (const p of allProducts) {
        productMap[p.id] = { name: p.name, emoji: p.emoji };
      }
      setOrder({ ...(o as Order), items });
      setProducts(productMap);
      setStatus(o.status as string);
    }
    load();
  }, [params.id]);

  async function handleStatusUpdate() {
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status } as never).eq("id", params.id as string);
    if (error) {
      alert(error.message);
    } else {
      router.refresh();
    }
  }

  if (!order) return <p className="text-sm text-ink-muted">Loading...</p>;

  const address = order.address as Record<string, string>;

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
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-9 px-3 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white"
          >
            {["Preparing", "Out for delivery", "Delivered", "Cancelled"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button
            onClick={handleStatusUpdate}
            className="h-9 px-4 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors"
          >
            Update
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white border border-[#e6e1d6] rounded-xl p-5">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">Delivery address</h3>
          <p className="text-sm text-dark">{address.name}</p>
          <p className="text-sm text-ink-soft">{address.line1}</p>
          <p className="text-sm text-ink-soft">{address.city} {address.postcode}</p>
          <p className="text-sm text-ink-soft">{address.country}</p>
        </div>

        <div className="bg-white border border-[#e6e1d6] rounded-xl p-5">
          <h3 className="text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">Order summary</h3>
          <div className="space-y-1.5 text-sm">
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
    </div>
  );
}
