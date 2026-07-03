import Link from "next/link";

const cols = [
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/shop" },
      { label: "Tubers & Grains", href: "/shop?category=grains" },
      { label: "Cooking Essentials", href: "/shop?category=cooking" },
      { label: "Spices & Seasonings", href: "/shop?category=spices" },
      { label: "Snacks & Drinks", href: "/shop?category=snacks" },
      { label: "Deals", href: "/deals" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Charity", href: "/charity" },
      { label: "Blog", href: "/blog" },
      { label: "Recipes", href: "/recipes" },
      { label: "Gift cards", href: "/gift-cards" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "FAQs", href: "/faq" },
      { label: "Delivery info", href: "/faq" },
      { label: "Track order", href: "/track-order" },
      { label: "Returns", href: "/faq" },
      { label: "Contact us", href: "/contact" },
      { label: "My account", href: "/account" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid lg:grid-cols-[1.4fr_3fr] gap-12">
          {/* Brand + newsletter */}
          <div>
            <Link href="/" className="flex items-center gap-2 mb-5">
              <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
                <rect width="32" height="32" rx="7" fill="#FF4200" />
                <path d="M10 13 C10 9.5 13 7.5 16 7.5 C19 7.5 22 9.5 22 13" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                <rect x="7" y="13" width="18" height="12" rx="2.5" fill="white" />
                <path d="M13 21 L16 15.5 L19 21 M14 19 H18" stroke="#FF4200" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-semibold text-lg tracking-tight text-dark">AfroMart</span>
            </Link>
            <p className="text-sm text-ink-soft leading-relaxed max-w-sm">
              Authentic African groceries, delivered across the UK in 24–48 hours. A taste of home, on time.
            </p>

            <form className="mt-6 flex max-w-sm rounded-full border border-line bg-white pl-5 pr-1 h-12 items-center">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-transparent text-sm text-dark focus:outline-none placeholder:text-ink-muted"
              />
              <button
                type="submit"
                className="h-10 px-5 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors"
              >
                Subscribe
              </button>
            </form>
            <p className="mt-3 text-xs text-ink-muted">Weekly drops, deals and recipes. No spam.</p>
          </div>

          {/* Link columns */}
          <div className="grid sm:grid-cols-3 gap-8">
            {cols.map((col) => (
              <div key={col.title}>
                <p className="text-[11px] tracking-[0.18em] uppercase text-ink-muted mb-4">{col.title}</p>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-dark hover:text-brand transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 pt-8 border-t border-line flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between text-xs text-ink-muted">
          <p>© {new Date().getFullYear()} AfroMart Ltd. Registered in England & Wales.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/terms" className="hover:text-dark">Terms</Link>
            <Link href="/privacy" className="hover:text-dark">Privacy</Link>
            <Link href="/cookies" className="hover:text-dark">Cookies</Link>
            <span>🇬🇧 English (UK) · £ GBP</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
