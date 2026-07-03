import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

export default function PageHero({
  eyebrow,
  title,
  blurb,
  crumbs,
  bg,
}: {
  eyebrow: string;
  title: string;
  blurb?: string;
  crumbs?: Crumb[];
  bg?: string;
}) {
  return (
    <section
      className="border-b border-line"
      style={bg ? { backgroundColor: bg } : undefined}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        {crumbs && crumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-sm text-ink-muted mb-5 flex-wrap">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {c.href ? (
                  <Link href={c.href} className="hover:text-dark">{c.label}</Link>
                ) : (
                  <span className="text-dark">{c.label}</span>
                )}
                {i < crumbs.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            ))}
          </nav>
        )}
        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">{eyebrow}</p>
        <h1 className="text-3xl lg:text-5xl font-semibold text-dark tracking-tight max-w-3xl">{title}</h1>
        {blurb && <p className="mt-4 text-ink-soft max-w-2xl leading-relaxed">{blurb}</p>}
      </div>
    </section>
  );
}
