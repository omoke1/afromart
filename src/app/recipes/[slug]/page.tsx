import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock, Users, ChefHat } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import RecipeAddAll from "@/components/sections/RecipeAddAll";
import { createServerSupabase } from "@/lib/supabase/server";

export default async function RecipeDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createServerSupabase();

  const recipeRaw = await supabase
    .from("recipes")
    .select("*")
    .eq("slug", slug)
    .single();
  const recipe = recipeRaw.data as { slug: string; title: string; emoji: string; bg_color: string; time: string; level: string; serves: number; intro: string; ingredients: { name: string; productId?: string; amount: string }[]; steps: string[] } | null;

  if (!recipe) notFound();

  const ingredients = recipe.ingredients;

  const productIds = ingredients
    .filter((i) => i.productId)
    .map((i) => i.productId!);

  const productRaw = await supabase
    .from("products")
    .select("id, name, emoji, bg_color, price, weight, category_id")
    .in("id", productIds);
  const productData = (productRaw.data ?? []) as { id: string; name: string; emoji: string; bg_color: string; price: number; weight: string; category_id: string }[];

  const productMap = new Map(productData.map((p) => [p.id, p]));

  const shoppable = ingredients
    .filter((i) => i.productId)
    .map((i) => {
      const p = productMap.get(i.productId!);
      return p ? { ...i, product: p } : null;
    })
    .filter((i): i is NonNullable<typeof i> => i !== null);

  const steps = recipe.steps as string[];

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />

      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8 flex-wrap">
          <Link href="/" className="hover:text-dark">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/recipes" className="hover:text-dark">Recipes</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-dark line-clamp-1">{recipe.title}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          <div
            className="aspect-square rounded-3xl flex items-center justify-center text-[200px] lg:text-[240px]"
            style={{ backgroundColor: recipe.bg_color }}
          >
            {recipe.emoji}
          </div>

          <div>
            <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Recipe</p>
            <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">{recipe.title}</h1>
            <p className="mt-4 text-ink-soft leading-relaxed">{recipe.intro}</p>

            <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
              <div>
                <dt className="text-ink-muted text-xs uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" />Time</dt>
                <dd className="text-dark font-medium mt-1">{recipe.time}</dd>
              </div>
              <div>
                <dt className="text-ink-muted text-xs uppercase tracking-wider flex items-center gap-1"><Users className="w-3 h-3" />Serves</dt>
                <dd className="text-dark font-medium mt-1">{recipe.serves}</dd>
              </div>
              <div>
                <dt className="text-ink-muted text-xs uppercase tracking-wider flex items-center gap-1"><ChefHat className="w-3 h-3" />Level</dt>
                <dd className="text-dark font-medium mt-1">{recipe.level}</dd>
              </div>
            </dl>

            {shoppable.length > 0 && <RecipeAddAll shoppable={shoppable} />}
          </div>
        </div>

        <div className="mt-20 grid lg:grid-cols-2 gap-12 lg:gap-16">
          <section>
            <h2 className="text-2xl font-semibold text-dark tracking-tight mb-6">Ingredients</h2>
            <ul className="divide-y divide-line border-y border-line">
              {ingredients.map((ing) => {
                const product = ing.productId ? productMap.get(ing.productId) : undefined;
                return (
                  <li key={ing.name} className="py-3.5 flex items-baseline gap-3">
                    <span className="flex-1">
                      {product ? (
                        <Link href={`/shop/${product.id}`} className="text-dark hover:text-brand font-medium">
                          {ing.name}
                        </Link>
                      ) : (
                        <span className="text-dark">{ing.name}</span>
                      )}
                    </span>
                    <span className="text-sm text-ink-muted">{ing.amount}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-dark tracking-tight mb-6">Steps</h2>
            <ol className="space-y-6">
              {steps.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="w-8 h-8 rounded-full bg-dark text-white text-sm font-semibold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-ink leading-relaxed pt-0.5">{step}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
