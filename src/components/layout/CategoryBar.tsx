"use client";

import Link from "next/link";
import {
  Gift,
  HeartHandshake,
  Newspaper,
  Megaphone,
  HelpCircle,
  Phone,
} from "lucide-react";

const navLinks = [
  { label: "Gift Cards", href: "/gift-cards", icon: Gift },
  { label: "Charity", href: "/charity", icon: HeartHandshake },
  { label: "Blog", href: "/blog", icon: Newspaper },
  { label: "About Us", href: "/about", icon: Megaphone },
  { label: "FAQs", href: "/faq", icon: HelpCircle },
];

export default function CategoryBar() {
  return (
    <div className="hidden md:block bg-white border-b border-line relative z-40">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="relative flex items-center justify-center h-14">

          {/* Centered nav links */}
          <nav className="flex items-center gap-8">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-brand transition-colors"
                >
                  <Icon className="w-4 h-4 text-ink-soft" />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Phone — pinned right */}
          <a
            href="tel:+2349000000000"
            className="absolute right-0 flex items-center gap-1.5 text-sm font-semibold text-green shrink-0"
          >
            <Phone className="w-4 h-4" />
            +234 900 000 0000
          </a>
        </div>
      </div>
    </div>
  );
}
