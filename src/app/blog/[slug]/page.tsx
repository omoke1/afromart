import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const postRaw = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .single();
  const post = postRaw.data as { slug: string; title: string; emoji: string; bg_color: string; category: string; author: string; date: string; read_time: string; excerpt: string; body: string[] } | null;

  if (!post) notFound();

  const othersRaw = await supabase
    .from("blog_posts")
    .select("*")
    .neq("slug", post.slug)
    .limit(3);
  const others = (othersRaw.data ?? []) as { slug: string; title: string; emoji: string; bg_color: string; category: string; read_time: string; excerpt: string }[];

  const otherPosts = others ?? [];

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />

      <article className="max-w-3xl mx-auto w-full px-4 sm:px-6 pt-8 lg:pt-12 pb-20 flex-1">
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8 flex-wrap">
          <Link href="/" className="hover:text-dark">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/blog" className="hover:text-dark">Blog</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-dark line-clamp-1">{post.title}</span>
        </nav>

        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-3">
          {post.category}
        </p>
        <h1 className="text-3xl lg:text-5xl font-semibold text-dark tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="mt-6 flex flex-wrap gap-5 text-sm text-ink-soft">
          <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{post.author}</span>
          <span>{post.date}</span>
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{post.read_time}</span>
        </div>

        <div
          className="mt-10 aspect-[16/9] rounded-3xl flex items-center justify-center text-[140px]"
          style={{ backgroundColor: post.bg_color }}
        >
          {post.emoji}
        </div>

        <div className="mt-12 space-y-6 text-[17px] leading-[1.7] text-ink">
          {(post.body as string[]).map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-line flex items-center justify-between">
          <Link href="/blog" className="text-sm font-semibold text-dark hover:text-brand">
            ← All articles
          </Link>
          <Link href="/shop" className="text-sm font-semibold text-dark hover:text-brand">
            Shop the pantry →
          </Link>
        </div>
      </article>

      {otherPosts.length > 0 && (
        <section className="border-t border-line bg-surface py-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-semibold text-dark tracking-tight mb-8">Keep reading</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
              {otherPosts.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                  <div
                    className="aspect-[4/3] rounded-2xl flex items-center justify-center text-6xl mb-3"
                    style={{ backgroundColor: p.bg_color }}
                  >
                    {p.emoji}
                  </div>
                  <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted mb-1">
                    {p.category} · {p.read_time}
                  </p>
                  <h3 className="font-semibold text-dark group-hover:text-brand transition-colors">
                    {p.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
