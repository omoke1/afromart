import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";

const values = [
  { title: "Authenticity", body: "Real African brands, sourced from the same suppliers your mother shops with." },
  { title: "Freshness", body: "Tight cold-chain logistics so frozen ponmo arrives frozen, not slushy." },
  { title: "Fairness", body: "We pay producers properly — diaspora prices, not exploitation prices." },
  { title: "Community", body: "1% of every order goes to UK-based African community kitchens." },
];

const milestones = [
  { year: "2024", text: "AfroMart founded in London by two Nigerian sisters tired of empty shelves." },
  { year: "2025", text: "First fulfilment hub opened in East London. 24–48h UK-wide delivery launched." },
  { year: "2026", text: "Crossed 10,000 households served and partnered with 30+ African brands." },
];

export default function AboutPage() {
  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />
      <PageHero
        eyebrow="Our story"
        title="A taste of home, delivered."
        blurb="AfroMart exists so that no African in the UK has to drive an hour to find proper egusi, ground crayfish or stockfish. We bring the market to your door."
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        bg="var(--color-surface)"
      />

      <div className="max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex-1">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div>
            <h2 className="text-2xl lg:text-3xl font-semibold text-dark tracking-tight">Why we started AfroMart</h2>
            <p className="mt-5 text-ink-soft leading-relaxed">
              When you arrive in the UK from Lagos, Accra or Nairobi, your first hunt is for home food. The reality? Patchy shops, miles between them, and prices that punish nostalgia. We knew the diaspora deserved better.
            </p>
            <p className="mt-4 text-ink-soft leading-relaxed">
              AfroMart is a full African supermarket online — staples, spices, fresh frozen meats and household items, delivered across the UK in 24 to 48 hours.
            </p>
          </div>
          <div className="rounded-3xl bg-surface aspect-[4/3] flex items-center justify-center text-8xl">
            🇳🇬🇬🇭🇰🇪
          </div>
        </div>

        <h2 className="mt-20 text-2xl lg:text-3xl font-semibold text-dark tracking-tight">What we stand for</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v) => (
            <div key={v.title} className="border border-line rounded-2xl p-6">
              <h3 className="font-semibold text-dark">{v.title}</h3>
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-20 text-2xl lg:text-3xl font-semibold text-dark tracking-tight">Our journey</h2>
        <ol className="mt-8 space-y-6 max-w-2xl">
          {milestones.map((m) => (
            <li key={m.year} className="flex gap-6 border-b border-line pb-6 last:border-b-0">
              <span className="text-2xl font-semibold text-brand shrink-0 w-20">{m.year}</span>
              <p className="text-ink-soft leading-relaxed">{m.text}</p>
            </li>
          ))}
        </ol>

        <div className="mt-20 rounded-3xl bg-dark text-white p-10 lg:p-16 text-center">
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">Stock your kitchen the easy way</h2>
          <p className="mt-3 text-white/70 max-w-xl mx-auto">Browse 500+ authentic African groceries. Free UK delivery on orders over £40.</p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center justify-center h-12 px-7 rounded-full bg-brand text-white text-sm font-semibold hover:bg-brand-hover transition-colors"
          >
            Start shopping
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
