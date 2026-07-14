import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import ProductBuyBox from "@/components/sections/ProductBuyBox";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const productRaw = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("id", id)
    .single();
  const product = productRaw.data as { id: string; name: string; price: number; emoji: string; bg_color: string; badge: string | null; weight: string; compare_at: number | null; description: string; origin: string | null; stock: number; category_id: string; image_url: string | null; categories: { name: string; slug: string } | null } | null;

  if (!product) notFound();

  const cat = product.categories;

  const relatedRaw = await supabase
    .from("products")
    .select("*, categories(name)")
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .limit(4);
  const related = (relatedRaw.data ?? []) as { id: string; name: string; price: number; emoji: string; bg_color: string; badge: string | null; weight: string; compare_at: number | null; image_url: string | null; categories: { name: string } | null }[];

  const displayProduct = {
    id: product.id,
    name: product.name,
    category: cat?.name ?? "",
    category_slug: cat?.slug ?? "",
    price: Number(product.price),
    compare_at: product.compare_at ? Number(product.compare_at) : null,
    emoji: product.emoji,
    bg_color: product.bg_color,
    badge: product.badge,
    weight: product.weight,
    description: product.description,
    origin: product.origin,
    stock: product.stock,
    image_url: product.image_url ?? "",
  };

  const relatedProducts = (related ?? []).map((p) => {
    const c = p.categories as { name: string } | null;
    return {
      id: p.id,
      name: p.name,
      category: c?.name ?? "",
      price: Number(p.price),
      compare_at: p.compare_at ? Number(p.compare_at) : null,
      emoji: p.emoji,
      bg_color: p.bg_color,
      badge: p.badge,
      weight: p.weight,
      image_url: p.image_url ?? "",
    };
  });

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8 flex-wrap">
          <Link href="/" className="hover:text-dark">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-dark">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/shop?category=${displayProduct.category_slug}`} className="hover:text-dark">{displayProduct.category}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-dark line-clamp-1">{displayProduct.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div
            className="aspect-square rounded-3xl flex items-center justify-center text-[180px] lg:text-[220px] overflow-hidden"
            style={{ backgroundColor: displayProduct.bg_color }}
          >
            {displayProduct.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={displayProduct.image_url}
                alt={displayProduct.name}
                className="w-full h-full object-contain p-6"
              />
            ) : (
              displayProduct.emoji
            )}
          </div>

          <div className="flex flex-col">
            <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">
              {displayProduct.category}
            </p>
            <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">{displayProduct.name}</h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-dark">£{displayProduct.price.toFixed(2)}</span>
              {displayProduct.compare_at && (
                <span className="text-lg text-ink-muted line-through">£{displayProduct.compare_at.toFixed(2)}</span>
              )}
              <span className="text-sm text-ink-muted ml-auto">{displayProduct.weight}</span>
            </div>

            <p className="mt-6 text-ink-soft leading-relaxed">{displayProduct.description}</p>

            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              {displayProduct.origin && (
                <div>
                  <dt className="text-ink-muted text-xs uppercase tracking-wider">Origin</dt>
                  <dd className="text-dark font-medium mt-1">{displayProduct.origin}</dd>
                </div>
              )}
              <div>
                <dt className="text-ink-muted text-xs uppercase tracking-wider">Availability</dt>
                <dd className="text-green font-medium mt-1">
                  {displayProduct.stock > 0 ? `In stock · ${displayProduct.stock} left` : "Out of stock"}
                </dd>
              </div>
            </dl>

            <ProductBuyBox product={displayProduct} />

            <ul className="mt-8 grid sm:grid-cols-3 gap-4 text-xs text-ink-soft">
              <li className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-dark mt-0.5" />
                <span><strong className="text-dark block">Free delivery</strong>on orders over £40</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-dark mt-0.5" />
                <span><strong className="text-dark block">Quality promise</strong>Sourced from trusted suppliers</span>
              </li>
              <li className="flex items-start gap-2">
                <RotateCcw className="w-4 h-4 text-dark mt-0.5" />
                <span><strong className="text-dark block">Easy returns</strong>14-day return window</span>
              </li>
            </ul>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">You may also like</p>
                <h2 className="text-2xl lg:text-3xl font-semibold text-dark tracking-tight">
                  More from {displayProduct.category}
                </h2>
              </div>
              <Link
                href={`/shop?category=${displayProduct.category_slug}`}
                className="text-sm font-medium text-dark hover:text-brand"
              >
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}
