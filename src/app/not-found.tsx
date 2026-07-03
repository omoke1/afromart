import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 pt-16 lg:pt-24 pb-20 text-center">
        <div className="text-[120px] lg:text-[160px] leading-none">🧺</div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mt-4 mb-2">Error 404</p>
        <h1 className="text-3xl lg:text-5xl font-semibold text-dark tracking-tight">
          That basket is empty.
        </h1>
        <p className="mt-4 text-ink-soft max-w-md mx-auto">
          The page you&apos;re after doesn&apos;t exist — it may have moved, or you may have followed a typo. Let&apos;s get you back on track.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="h-11 px-6 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors flex items-center justify-center"
          >
            Back to home
          </Link>
          <Link
            href="/shop"
            className="h-11 px-6 rounded-full border border-line text-dark text-sm font-semibold hover:border-dark transition-colors flex items-center justify-center"
          >
            Browse the shop
          </Link>
        </div>

        <div className="mt-12 text-sm text-ink-muted">
          Looking for something specific?{" "}
          <Link href="/search" className="text-dark font-semibold hover:text-brand">
            Try a search
          </Link>
          .
        </div>
      </div>

      <Footer />
    </main>
  );
}
