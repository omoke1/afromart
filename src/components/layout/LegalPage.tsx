import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
};

export default function LegalPage({
  eyebrow,
  title,
  blurb,
  lastUpdated,
  crumbLabel,
  sections,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  lastUpdated: string;
  crumbLabel: string;
  sections: LegalSection[];
}) {
  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />
      <PageHero
        eyebrow={eyebrow}
        title={title}
        blurb={blurb}
        crumbs={[{ label: "Home", href: "/" }, { label: crumbLabel }]}
        bg="var(--color-surface)"
      />

      <article className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-16 flex-1">
        <p className="text-xs text-ink-muted mb-10">Last updated: {lastUpdated}</p>

        <div className="space-y-12">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-xl lg:text-2xl font-semibold text-dark tracking-tight">
                {i + 1}. {s.heading}
              </h2>
              <div className="mt-4 space-y-4 text-ink leading-[1.7]">
                {s.paragraphs.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-16 pt-8 border-t border-line text-sm text-ink-soft">
          Questions? Email{" "}
          <Link href="mailto:hello@afromart.co.uk" className="text-dark font-semibold hover:text-brand">
            hello@afromart.co.uk
          </Link>
          .
        </div>
      </article>

      <Footer />
    </main>
  );
}
