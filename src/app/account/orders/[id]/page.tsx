import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Package, Truck, Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
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
  }).filter((l) => l.product !== null) as { productId: string; qty: number; product: { id: string; name: string; category: string; emoji: string; bg_color: string; price: number; weight: string } }[];

  const total = Number(order.total);
  const address = order.address as { name?: string; line1?: string; city?: string; postcode?: string; country?: string };

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />

      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8 flex-wrap">
          <Link href="/" className="hover:text-dark">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/account" className="hover:text-dark">Account</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-dark">{order.id}</span>
        </nav>

        <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Order details</p>
            <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">{order.id}</h1>
            <p className="mt-2 text-ink-soft text-sm">
              Placed on {new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <span className="text-xs font-medium text-green bg-green/10 px-3 py-1.5 rounded-full">
            {order.status}
          </span>
        </div>

        <div className="border border-line rounded-2xl p-6 mb-10">
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-0 relative">
            <Step icon={<Check className="w-4 h-4" />} title="Order placed" date={new Date(order.created_at).toLocaleDateString()} done />
            <Step icon={<Package className="w-4 h-4" />} title="Packed & dispatched" date="Next day" done />
            <Step icon={<Truck className="w-4 h-4" />} title="Delivered" date="24–48h" done={order.status === "Delivered"} />
          </div>
        </div>

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

            <button className="mt-8 h-11 px-5 rounded-full border border-line text-dark text-sm font-semibold hover:border-dark hover:bg-surface transition-colors">
              Re-order everything
            </button>
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

            <Link href="/account" className="block text-sm font-semibold text-dark hover:text-brand">
              ← All orders
            </Link>
          </aside>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function Step({
  icon,
  title,
  date,
  done,
}: {
  icon: React.ReactNode;
  title: string;
  date: string;
  done?: boolean;
}) {
  return (
    <div className="flex sm:flex-col items-start sm:items-center gap-3">
      <div
        className={
          "w-9 h-9 rounded-full flex items-center justify-center shrink-0 " +
          (done ? "bg-green text-white" : "bg-surface text-ink-muted")
        }
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-dark">{title}</p>
        <p className="text-xs text-ink-muted">{date}</p>
      </div>
    </div>
  );
}
