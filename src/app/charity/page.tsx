import Link from "next/link";
import { Heart, Users, Utensils } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";

const partners = [
  { name: "Sufra NW London", role: "Hot meals for refugees in Brent.", emoji: "🍲" },
  { name: "African Pot Kitchen", role: "Weekly community lunches in Peckham.", emoji: "🥘" },
  { name: "Naija Aid UK", role: "Care packages for new arrivals.", emoji: "📦" },
];

export default function CharityPage() {
  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />
      <PageHero
        eyebrow="1% for community"
        title="Every basket feeds someone else."
        blurb="1% of every AfroMart order is donated to UK-based African community kitchens and food charities. No ticking the box, no extra cost — it&apos;s baked in."
        crumbs={[{ label: "Home", href: "/" }, { label: "Charity" }]}
        bg="var(--color-surface)"
      />

      <div className="max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24 flex-1">
        <div className="grid sm:grid-cols-3 gap-5">
          <Stat icon={<Heart className="w-5 h-5 text-brand" />} value="£24,800" label="donated in 2025" />
          <Stat icon={<Utensils className="w-5 h-5 text-brand" />} value="12,400" label="meals funded" />
          <Stat icon={<Users className="w-5 h-5 text-brand" />} value="3" label="charity partners" />
        </div>

        <section className="mt-20">
          <h2 className="text-2xl lg:text-3xl font-semibold text-dark tracking-tight">Who we support</h2>
          <p className="mt-3 text-ink-soft max-w-2xl">
            We choose partners that serve African and Caribbean communities across the UK and operate transparently.
          </p>
          <div className="mt-10 grid sm:grid-cols-3 gap-6">
            {partners.map((p) => (
              <div key={p.name} className="border border-line rounded-2xl p-6 text-center">
                <div className="text-5xl mb-4">{p.emoji}</div>
                <h3 className="font-semibold text-dark">{p.name}</h3>
                <p className="mt-2 text-sm text-ink-soft leading-relaxed">{p.role}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-20 rounded-3xl bg-brand text-white p-10 lg:p-14 text-center">
          <h2 className="text-2xl lg:text-3xl font-semibold tracking-tight">Want to nominate a kitchen?</h2>
          <p className="mt-3 text-white/85 max-w-xl mx-auto">
            We&apos;re always looking for community groups doing the real work. Send us their story.
          </p>
          <Link
            href="mailto:community@afromart.co.uk"
            className="mt-8 inline-flex items-center justify-center h-12 px-7 rounded-full bg-white text-dark text-sm font-semibold hover:bg-surface transition-colors"
          >
            community@afromart.co.uk
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="border border-line rounded-2xl p-6">
      <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center mb-4">{icon}</div>
      <p className="text-3xl font-semibold text-dark tracking-tight">{value}</p>
      <p className="text-sm text-ink-muted mt-1">{label}</p>
    </div>
  );
}
