"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";

const groups = [
  {
    title: "Delivery",
    items: [
      { q: "Where do you deliver?", a: "Anywhere in the UK — England, Scotland, Wales and Northern Ireland. We use tracked 24–48h courier services." },
      { q: "How much is delivery?", a: "£4.99 standard. Free on orders over £40." },
      { q: "Can I get same-day delivery?", a: "Same-day is available in Greater London for orders placed before 11am." },
    ],
  },
  {
    title: "Products & freshness",
    items: [
      { q: "Are frozen items safe in transit?", a: "Yes — frozen orders ship in insulated boxes with gel packs, dispatched on Monday–Wednesday to avoid weekend transit." },
      { q: "Do you stock fresh produce?", a: "We stock cassava, plantain and other fresh roots seasonally. Check the Tubers & Grains category." },
      { q: "Where do you source your products?", a: "Directly from West and East African producers, plus trusted importers for items like stockfish." },
    ],
  },
  {
    title: "Orders & returns",
    items: [
      { q: "Can I change my order?", a: "Yes, within 30 minutes of checkout. After that we may already have started picking — message support fast." },
      { q: "What is your return policy?", a: "Unopened pantry items can be returned within 14 days. Frozen and perishable items are non-returnable unless damaged on arrival." },
      { q: "Something arrived damaged. What now?", a: "Email hello@afromart.co.uk with photos within 48 hours of delivery and we&apos;ll refund or replace immediately." },
    ],
  },
];

export default function FAQPage() {
  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />
      <PageHero
        eyebrow="Help centre"
        title="Frequently asked questions"
        blurb="The quick answers. Can't find what you need? Email hello@afromart.co.uk and we'll respond within a few hours."
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQs" }]}
        bg="var(--color-surface)"
      />

      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-16 flex-1 space-y-14">
        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="text-xl font-semibold text-dark mb-4">{g.title}</h2>
            <ul className="border-y border-line divide-y divide-line">
              {g.items.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <Footer />
    </main>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <li>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-medium text-dark">{q}</span>
        {open ? <Minus className="w-4 h-4 text-ink-muted shrink-0" /> : <Plus className="w-4 h-4 text-ink-muted shrink-0" />}
      </button>
      {open && <p className="pb-5 text-sm text-ink-soft leading-relaxed">{a}</p>}
    </li>
  );
}
