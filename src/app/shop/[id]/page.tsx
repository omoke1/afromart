import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/ui/ProductCard";
import ProductBuyBox from "@/components/sections/ProductBuyBox";
import ProductReviews, { type ReviewItem } from "@/components/sections/ProductReviews";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getServerUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  type OptionRow = { id: string; weight: string; price: number; compare_at: number | null; stock: number };

  const productRaw = await supabase
    .from("products")
    .select("*, categories(name, slug), subcategories(name, slug), product_options(id, weight, price, compare_at, stock)")
    .eq("id", id)
    .single();
  const product = productRaw.data as unknown as { id: string; name: string; price: number; emoji: string; bg_color: string; badge: string | null; weight: string; compare_at: number | null; description: string; description_long: string; origin: string | null; stock: number; category_id: string; subcategory_id: string | null; image_url: string | null; categories: { name: string; slug: string } | null; subcategories: { name: string; slug: string } | null; product_options: OptionRow[] | null } | null;

  if (!product) notFound();

  const [reviewRes, user] = await Promise.all([
    // Admin client so the reviewer's name comes through — the public client
    // would be blocked from joining profiles by RLS.
    createAdminClient()
      .from("reviews")
      .select("id, rating, title, body, created_at, user_id, profiles(name)")
      .eq("product_id", id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false }),
    getServerUser(),
  ]);

  const reviewRows = (reviewRes.data ?? []) as {
    id: string;
    rating: number;
    title: string;
    body: string;
    created_at: string;
    user_id: string;
    profiles: { name: string | null } | null;
  }[];

  const reviews: ReviewItem[] = reviewRows.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    created_at: r.created_at,
    authorName: r.profiles?.name ?? null,
    isOwner: r.user_id === user?.id,
  }));

  const reviewCount = reviews.length;
  const reviewAverage =
    reviewCount > 0
      ? reviewRows.reduce((sum, r) => sum + r.rating, 0) / reviewCount
      : 0;
  const hasReviewed = reviews.some((r) => r.isOwner);
  const canReview = !!user && !hasReviewed;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.afromart.xyz";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image_url ?? undefined,
    category: product.categories?.name ?? undefined,
    offers: {
      "@type": "Offer",
      priceCurrency: "GBP",
      price: Number(product.price),
      availability: product.stock === 0 ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${siteUrl}/shop/${product.id}`,
    },
    ...(reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewAverage.toFixed(1),
            reviewCount,
          },
        }
      : {}),
  };

  const cat = product.categories;
  const subcat = product.subcategories;
  const options = (product.product_options ?? [])
    .map((o) => ({
      id: o.id,
      weight: o.weight,
      price: Number(o.price),
      compare_at: o.compare_at ? Number(o.compare_at) : null,
      stock: o.stock,
    }))
    .sort((a, b) => a.price - b.price);

  const relatedRes = await supabase
    .from("related_products")
    .select("related_id")
    .eq("product_id", id);
  const curatedIds = (relatedRes.data ?? []).map((r) => r.related_id);

  const relatedRaw =
    curatedIds.length > 0
      ? await supabase
          .from("products")
          .select("*, categories(name), product_options(id, weight, price, stock)")
          .in("id", curatedIds)
          .limit(4)
      : await supabase
          .from("products")
          .select("*, categories(name), product_options(id, weight, price, stock)")
          .eq("category_id", product.category_id)
          .neq("id", product.id)
          .limit(4);
  const related = (relatedRaw.data ?? []) as unknown as { id: string; name: string; price: number; emoji: string; bg_color: string; badge: string | null; weight: string; compare_at: number | null; image_url: string | null; categories: { name: string } | null; product_options: OptionRow[] | null }[];

  const displayProduct = {
    id: product.id,
    name: product.name,
    category: cat?.name ?? "",
    category_slug: cat?.slug ?? "",
    subcategory: subcat?.name ?? null,
    subcategory_slug: subcat?.slug ?? null,
    price: Number(product.price),
    compare_at: product.compare_at ? Number(product.compare_at) : null,
    emoji: product.emoji,
    bg_color: product.bg_color,
    badge: product.badge,
    weight: product.weight,
    description: product.description,
    description_long: product.description_long,
    origin: product.origin,
    stock: product.stock,
    image_url: product.image_url ?? "",
    options,
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
      options: (p.product_options ?? [])
        .map((o) => ({
          id: o.id,
          weight: o.weight,
          price: Number(o.price),
          compare_at: o.compare_at ? Number(o.compare_at) : null,
          stock: o.stock,
        }))
        .sort((a, b) => a.price - b.price),
    };
  });

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <CategoryBar />

      <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-10 pt-5 lg:pt-7 pb-20 flex-1">
        <nav className="flex items-center gap-7 text-sm text-dark mb-8" aria-label="Product navigation">
          <Link href="/shop" className="flex items-center gap-2 hover:text-brand transition-colors">
            <span className="grid grid-cols-2 gap-0.5" aria-hidden="true">
              <span className="w-1.5 h-1.5 rounded-sm border border-current" />
              <span className="w-1.5 h-1.5 rounded-sm border border-current" />
              <span className="w-1.5 h-1.5 rounded-sm border border-current" />
              <span className="w-1.5 h-1.5 rounded-sm border border-current" />
            </span>
            Categories
          </Link>
          <Link href="/shop" className="flex items-center gap-2 hover:text-brand transition-colors">
            <span className="w-4 h-4 rounded-md border border-current" aria-hidden="true" />
            Products
          </Link>
        </nav>

        <Link href="/shop" className="mb-8 inline-flex items-center gap-2 text-base font-semibold text-dark hover:text-brand transition-colors">
          <span className="text-2xl leading-none" aria-hidden="true">‹</span>
          {displayProduct.name}
        </Link>

        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8 flex-wrap" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-dark">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/shop" className="hover:text-dark">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/shop?category=${displayProduct.category_slug}`} className="hover:text-dark">{displayProduct.category}</Link>
          {displayProduct.subcategory && (
            <>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href={`/shop?category=${displayProduct.category_slug}&subcategory=${displayProduct.subcategory_slug}`} className="hover:text-dark">{displayProduct.subcategory}</Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-dark line-clamp-1">{displayProduct.name}</span>
        </nav>

        <div className="grid lg:grid-cols-[1.04fr_1fr] gap-8 lg:gap-12 items-start">
          <div>
            <div
              className="aspect-[1.08] rounded-sm border border-[#f2f0ec] bg-white flex items-center justify-center text-[180px] lg:text-[220px] overflow-hidden"
              style={{ backgroundColor: displayProduct.bg_color }}
            >
              {displayProduct.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={displayProduct.image_url}
                  alt={displayProduct.name}
                  className="w-full h-full object-contain p-5 lg:p-8"
                />
              ) : (
                displayProduct.emoji
              )}
            </div>
            <section className="mt-4 px-3 lg:px-4">
              <h2 className="text-lg font-medium text-dark mb-2">Description</h2>
              <p className="text-base text-ink leading-relaxed">{displayProduct.description}</p>
              <button type="button" className="mt-3 text-sm font-medium text-brand hover:text-brand-hover">
                Read all
              </button>
            </section>
          </div>

          <div className="flex flex-col rounded-xl border border-line bg-white p-6 lg:p-7 shadow-[0_2px_10px_rgba(30,0,12,0.03)]">
            <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">
              {displayProduct.category}
            </p>
            <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">{displayProduct.name}</h1>

            {displayProduct.origin && (
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-ink-muted text-xs uppercase tracking-wider">Origin</dt>
                  <dd className="text-dark font-medium mt-1">{displayProduct.origin}</dd>
                </div>
              </dl>
            )}

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

        {displayProduct.description_long ? (
          <section className="mt-14 max-w-3xl">
            <h2 className="text-xl lg:text-2xl font-semibold text-dark tracking-tight mb-4">
              Product details
            </h2>
            <div className="text-ink-soft leading-relaxed whitespace-pre-line">
              {displayProduct.description_long}
            </div>
          </section>
        ) : null}

        <ProductReviews
          productId={displayProduct.id}
          reviews={reviews}
          average={reviewAverage}
          count={reviewCount}
          canReview={canReview}
          hasReviewed={hasReviewed}
        />

        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">You may also like</p>
                <h2 className="text-2xl lg:text-3xl font-semibold text-dark tracking-tight">
                  {curatedIds.length > 0 ? "You may also like" : `More from ${displayProduct.category}`}
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
