import Link from "next/link";
import { Check, Truck } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; total?: string }>;
}) {
  const { id, total } = await searchParams;
  const orderId = id ?? "AFM-DEMO01";

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 pt-12 lg:pt-20 pb-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-green/15 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-green" />
        </div>

        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Order confirmed</p>
        <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">
          Thank you for shopping with AfroMart
        </h1>
        <p className="mt-4 text-ink-soft">
          We&apos;ve sent a confirmation email with your receipt and tracking details. Your order will arrive in 24–48 hours.
        </p>

        <div className="mt-8 border border-line rounded-2xl p-6 text-left">
          <dl className="grid sm:grid-cols-2 gap-5 text-sm">
            <div>
              <dt className="text-ink-muted text-xs uppercase tracking-wider">Order number</dt>
              <dd className="text-dark font-semibold mt-1">{orderId}</dd>
            </div>
            {total && (
              <div>
                <dt className="text-ink-muted text-xs uppercase tracking-wider">Total paid</dt>
                <dd className="text-dark font-semibold mt-1">£{total}</dd>
              </div>
            )}
            <div>
              <dt className="text-ink-muted text-xs uppercase tracking-wider">Delivery</dt>
              <dd className="text-dark font-medium mt-1 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                24–48h UK delivery
              </dd>
            </div>
            <div>
              <dt className="text-ink-muted text-xs uppercase tracking-wider">Status</dt>
              <dd className="text-green font-medium mt-1">Preparing for dispatch</dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/account"
            className="h-11 px-6 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors flex items-center justify-center"
          >
            View my orders
          </Link>
          <Link
            href="/shop"
            className="h-11 px-6 rounded-full border border-line text-dark text-sm font-semibold hover:border-dark transition-colors flex items-center justify-center"
          >
            Keep shopping
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
