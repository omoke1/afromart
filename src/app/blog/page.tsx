import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function BlogPage() {
  const supabase = await createServerSupabase();
  const postsRaw = await supabase
    .from("blog_posts")
    .select("*")
    .order("date", { ascending: false });
  const allPosts = (postsRaw.data ?? []) as { slug: string; title: string; emoji: string; bg_color: string; category: string; author: string; date: string; read_time: string; excerpt: string }[];
  const [featured, ...rest] = allPosts;

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />
      <PageHero
        eyebrow="Journal"
        title="Recipes, ingredients and diaspora stories."
        blurb="Cooking advice, supplier visits and the small things that make African food at home taste right."
        crumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
        bg="var(--color-surface)"
      />

      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex-1">
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block mb-16">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div
                className="aspect-[4/3] rounded-3xl flex items-center justify-center text-[160px]"
                style={{ backgroundColor: featured.bg_color }}
              >
                {featured.emoji}
              </div>
              <div>
                <p className="text-[11px] tracking-[0.18em] uppercase text-ink-muted mb-3">
                  {featured.category} · {featured.read_time}
                </p>
                <h2 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight group-hover:text-brand transition-colors">
                  {featured.title}
                </h2>
                <p className="mt-4 text-ink-soft leading-relaxed">{featured.excerpt}</p>
                <span className="mt-6 inline-block text-sm font-semibold text-dark group-hover:text-brand">
                  Read article →
                </span>
              </div>
            </div>
          </Link>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {rest.map((p) => (
            <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
              <div
                className="aspect-[4/3] rounded-2xl flex items-center justify-center text-7xl mb-4"
                style={{ backgroundColor: p.bg_color }}
              >
                {p.emoji}
              </div>
              <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted mb-2">
                {p.category} · {p.read_time}
              </p>
              <h3 className="text-lg font-semibold text-dark group-hover:text-brand transition-colors leading-snug">
                {p.title}
              </h3>
              <p className="mt-2 text-sm text-ink-soft line-clamp-2">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
