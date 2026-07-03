"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  eyebrow?: string;
  title: string;
  tags: string[];
  cta: { label: string; href: string };
  image: string;
  imageAlt: string;
  bg: string; // background style
};

const slides: Slide[] = [
  {
    title: "Naija Food,\nDelivered Abroad.",
    tags: ["Authentic", "Affordable", "Farm-fresh"],
    cta: { label: "Shop Now", href: "/shop" },
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1100&q=80",
    imageAlt: "A spread of authentic Nigerian groceries and spices",
    bg: "linear-gradient(120deg, #DCF0D8 0%, #E8F5E2 60%, #DCF0D8 100%)",
  },
  {
    eyebrow: "This week only",
    title: "Free Delivery\non Orders Over £40.",
    tags: ["Fast", "Tracked", "UK-wide"],
    cta: { label: "Start Shopping", href: "/shop" },
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1100&q=80",
    imageAlt: "Fresh vegetables and grocery ingredients",
    bg: "linear-gradient(120deg, #FFE7D6 0%, #FFF1E8 60%, #FFE7D6 100%)",
  },
  {
    eyebrow: "New arrivals",
    title: "Spices & Seasonings,\nStraight from Home.",
    tags: ["Bold", "Aromatic", "Trusted brands"],
    cta: { label: "Explore Spices", href: "/shop?category=spices" },
    image:
      "https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=1100&q=80",
    imageAlt: "Colourful spices arranged in bowls",
    bg: "linear-gradient(120deg, #FBE9C9 0%, #FFF6E6 60%, #FBE9C9 100%)",
  },
];

const TAG_COLORS = ["bg-gold/70 text-dark", "bg-green/30 text-dark", "bg-green text-white"];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => setIndex((i) => (i + 1) % slides.length), []);
  const prev = useCallback(() => setIndex((i) => (i - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  return (
    <section className="w-full">
      <div className="relative overflow-hidden">
        {/* Slides track */}
        <div
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, i) => (
            <div
              key={i}
              className="relative w-full shrink-0 grid lg:grid-cols-2 items-center min-h-[260px] lg:min-h-[320px]"
              style={{ background: slide.bg }}
            >
              {/* Copy */}
              <div className="relative z-10 px-8 sm:px-12 lg:px-16 py-10 lg:py-12">
                {slide.eyebrow && (
                  <p className="text-xs font-semibold tracking-[0.18em] uppercase text-brand mb-3">
                    {slide.eyebrow}
                  </p>
                )}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark leading-[1.05] tracking-tight whitespace-pre-line">
                  {slide.title}
                </h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {slide.tags.map((tag, t) => (
                    <span
                      key={tag}
                      className={`text-sm font-semibold px-4 py-1.5 rounded-full ${TAG_COLORS[t % TAG_COLORS.length]}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={slide.cta.href}
                  className="mt-6 inline-flex items-center gap-2 bg-gold hover:bg-brand hover:text-white text-dark font-semibold px-6 py-3 rounded-full transition-colors"
                >
                  {slide.cta.label}
                  <span aria-hidden>→</span>
                </Link>
              </div>

              {/* Image */}
              <div className="relative h-48 lg:h-full lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[48%]">
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                  priority={i === 0}
                />
                {/* Left fade so text never clashes with photo on desktop */}
                <div
                  className="hidden lg:block absolute inset-y-0 left-0 w-24"
                  style={{ background: `linear-gradient(90deg, ${slide.bg.match(/#[0-9A-Fa-f]{6}/)?.[0] ?? "#fff"}, transparent)` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          aria-label="Previous slide"
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-dark shadow-md flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={next}
          aria-label="Next slide"
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-dark shadow-md flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-6 bg-dark" : "w-2 bg-dark/30 hover:bg-dark/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
