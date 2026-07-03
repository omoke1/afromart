"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExpandingSearchDock } from "@/components/ui/expanding-search-dock-shadcnui";
import UserIcon from "@/components/icons/user-icon";
import { useCart } from "@/lib/cart";

const categories = [
  "All Categories",
  "Rice & Grains",
  "Spices & Seasonings",
  "Palm Oil & Sauces",
  "Snacks & Drinks",
  "Frozen Foods",
  "Nigerian Brands",
];

export default function Navbar() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [menuOpen, setMenuOpen] = useState(false);
  const { count, openDrawer } = useCart();
  const router = useRouter();

  return (
    <header className="bg-brand max-md:sticky max-md:top-0 max-md:z-50">
      <div className="w-full px-4 sm:px-6 lg:px-10">
        <div className="px-0 h-[68px] flex items-center gap-3 lg:gap-5">

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white hover:bg-white/10 w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          aria-label="Menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-2">
          <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
            <rect width="32" height="32" rx="7" fill="white" />
            <path d="M10 13 C10 9.5 13 7.5 16 7.5 C19 7.5 22 9.5 22 13" stroke="#FF4200" strokeWidth="2" strokeLinecap="round" fill="none" />
            <rect x="7" y="13" width="18" height="12" rx="2.5" fill="#FF4200" />
            <path d="M13 21 L16 15.5 L19 21 M14 19 H18" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-white font-semibold text-lg tracking-tight hidden sm:inline">AfroMart</span>
        </Link>

        {/* Deliver to (Amazon-style) */}
        <button className="hidden lg:flex items-center gap-1.5 text-white hover:bg-white/10 rounded-lg px-2.5 py-1.5 shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="text-left leading-tight">
            <p className="text-[10px] text-white/70">Deliver to</p>
            <p className="text-xs font-semibold text-white">London E1 ▾</p>
          </div>
        </button>

        {/* Expanding search dock + optional category quick-pick */}
        <div className="flex-1 flex items-center justify-end gap-3 mx-1">
          <div className="hidden md:block">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white text-xs text-ink font-medium px-4 py-2.5 rounded-full focus:outline-none cursor-pointer appearance-none pr-8 shadow-sm"
              style={{ backgroundImage: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='%23555' d='M5 6 0 0h10z'/></svg>\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
            >
              {categories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <ExpandingSearchDock onSearch={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)} />
        </div>

        {/* Delivery urgency (Gromuse-style) */}
        <div className="hidden xl:flex items-center gap-2 text-white shrink-0">
          <span className="text-gold text-base">⚡</span>
          <div className="text-xs leading-tight">
            <p className="text-white/80">Order now, get it in</p>
            <p className="font-semibold text-gold">24–48 hours</p>
          </div>
        </div>

        {/* Cart */}
        <button
          onClick={openDrawer}
          className="relative bg-white hover:bg-stone-100 text-ink w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
          aria-label="Open cart"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.7} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-dark text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-brand">
            {count}
          </span>
        </button>

        {/* Account avatar — animated user icon */}
        <Link
          href="/account"
          className="w-10 h-10 bg-white hover:bg-stone-100 text-ink rounded-full flex items-center justify-center shrink-0 transition-colors"
          aria-label="Account"
        >
          <UserIcon size={20} strokeWidth={1.8} />
        </Link>
        </div>
      </div>

      {/* Left sidebar drawer */}
      {/* Overlay */}
      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/40 transition-opacity duration-300 ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        className={`fixed top-0 left-0 z-[70] h-full w-[300px] max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-label="Menu"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 h-[68px] border-b border-line shrink-0">
          <Link href="/" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
            <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
              <rect width="32" height="32" rx="7" fill="#FF4200" />
              <path d="M10 13 C10 9.5 13 7.5 16 7.5 C19 7.5 22 9.5 22 13" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
              <rect x="7" y="13" width="18" height="12" rx="2.5" fill="white" />
              <path d="M13 21 L16 15.5 L19 21 M14 19 H18" stroke="#FF4200" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold text-lg tracking-tight text-ink">AfroMart</span>
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 rounded-full hover:bg-surface text-ink flex items-center justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          <p className="px-5 mb-2 text-[11px] tracking-[0.18em] uppercase text-ink-muted">Shop by Department</p>
          {[
            { label: "All Products", href: "/shop", emoji: "🛒" },
            { label: "Tubers & Grains", href: "/shop?category=tubers-grains", emoji: "🍠" },
            { label: "Protein", href: "/shop?category=protein", emoji: "🐟" },
            { label: "Cooking Essentials", href: "/shop?category=cooking-essentials", emoji: "🫙" },
            { label: "Spices & Seasonings", href: "/shop?category=spices", emoji: "🌶️" },
            { label: "Organic Foods", href: "/shop?category=organic", emoji: "🍯" },
            { label: "Snacks & Drinks", href: "/shop?category=snacks", emoji: "🥤" },
            { label: "Household", href: "/shop?category=household", emoji: "🧻" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-ink hover:bg-surface transition-colors"
            >
              <span className="text-lg">{item.emoji}</span>
              {item.label}
            </Link>
          ))}

          <div className="my-3 mx-5 border-t border-line" />

          {[
            { label: "Recipes", href: "/recipes" },
            { label: "Deals", href: "/deals" },
            { label: "About Us", href: "/about" },
            { label: "My Account", href: "/account" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="block px-5 py-3 text-sm font-medium text-ink-soft hover:bg-surface hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="px-5 py-4 border-t border-line shrink-0">
          <p className="text-xs text-ink-muted">Delivering across the UK · 24–48h</p>
        </div>
      </aside>
    </header>
  );
}
