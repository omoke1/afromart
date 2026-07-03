import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";
import ProductCard from "@/components/ui/ProductCard";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function DealsPage() {
  const supabase = await createServerSupabase();

  const productsRaw = await supabase
    .from("products")
    .select("*, categories(name)")
    .not("compare_at", "is", null)
    .gt("compare_at", 0);
  const products = (productsRaw.data ?? []) as { id: string; name: string; price: number; compare_at: number; emoji: string; bg_color: string; badge: string | null; weight: string; categories: { name: string } | null }[];

  const onSale = (products ?? []).map((p) => {
    const cat = p.categories as { name: string } | null;
    return {
      id: p.id,
      name: p.name,
      category: cat?.name ?? "",
      price: Number(p.price),
      compare_at: Number(p.compare_at),
      emoji: p.emoji,
      bg_color: p.bg_color,
      badge: p.badge,
      weight: p.weight,
    };
  });

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />
      <PageHero
        eyebrow="This week"
        title="Deals worth the trip."
        blurb="Limited-time prices on AfroMart favourites. Stock up before they&apos;re gone."
        crumbs={[{ label: "Home", href: "/" }, { label: "Deals" }]}
        bg="#FFF2EC"
      />

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex-1">
        {onSale.length === 0 ? (
          <div className="border border-line rounded-3xl py-20 text-center">
            <p className="text-dark font-medium">No active deals right now.</p>
            <p className="text-ink-muted text-sm mt-2 mb-6">Check back soon — we drop new prices every Thursday.</p>
            <Link href="/shop" className="inline-flex items-center justify-center h-11 px-6 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand">
              Browse the shop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {onSale.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}
