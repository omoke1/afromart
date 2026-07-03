import Link from "next/link";
import { Clock, Users } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function RecipesPage() {
  const supabase = await createServerSupabase();
  const recipesRaw = await supabase
    .from("recipes")
    .select("*")
    .order("title");
  const recipes = (recipesRaw.data ?? []) as { slug: string; title: string; emoji: string; bg_color: string; time: string; level: string; serves: number }[];

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />
      <PageHero
        eyebrow="From the kitchen"
        title="Recipes that travel well."
        blurb="Step-by-step African home cooking with shoppable ingredients. Tap any recipe to add the basket in one click."
        crumbs={[{ label: "Home", href: "/" }, { label: "Recipes" }]}
        bg="var(--color-surface)"
      />

      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex-1">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {(recipes ?? []).map((r) => (
            <Link key={r.slug} href={`/recipes/${r.slug}`} className="group">
              <div
                className="aspect-[4/3] rounded-2xl flex items-center justify-center text-7xl mb-4"
                style={{ backgroundColor: r.bg_color }}
              >
                {r.emoji}
              </div>
              <h3 className="text-lg font-semibold text-dark group-hover:text-brand transition-colors">{r.title}</h3>
              <div className="mt-2 flex items-center gap-4 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{r.time}</span>
                <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />Serves {r.serves}</span>
                <span>{r.level}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
