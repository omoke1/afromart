"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, ChevronDown, X, Check } from "lucide-react";

const QUICK_PICKS = ["London", "Manchester", "Birmingham", "Leeds", "Bristol", "Glasgow"];

type Props = {
  value: string;
  onChange: (v: string) => void;
  /** "pill" = compact button for the orange navbar; "row" = full-width bar for mobile */
  variant?: "pill" | "row";
};

export default function DeliverTo({ value, onChange, variant = "pill" }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setInput(value), [value]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function save(v: string) {
    const clean = v.trim();
    if (!clean) return;
    onChange(clean);
    setOpen(false);
  }

  const label = value || "Set location";

  return (
    <div ref={ref} className={"relative " + (variant === "row" ? "w-full" : "")}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Choose delivery location"
        aria-expanded={open}
        className={
          variant === "pill"
            ? "flex items-center gap-1.5 bg-white text-ink hover:bg-stone-100 rounded-full pl-2.5 pr-3 h-8 shrink-0 shadow-sm transition-colors"
            : "flex items-center gap-2 w-full text-white/90 hover:text-white py-2"
        }
      >
        <MapPin className={"w-4 h-4 shrink-0 " + (variant === "pill" ? "text-brand" : "")} />
        <span className="text-left leading-tight">
          <span className={"block text-[10px] " + (variant === "pill" ? "text-ink-muted" : "text-white/60")}>
            Deliver to
          </span>
          <span
            className={
              "block text-xs font-semibold truncate max-w-[120px] " +
              (variant === "pill" ? "text-dark" : "text-white")
            }
          >
            {label}
          </span>
        </span>
        <ChevronDown
          className={
            "w-3.5 h-3.5 transition-transform " +
            (variant === "pill" ? "text-ink-muted" : "text-white/70") +
            (open ? " rotate-180" : "")
          }
        />
      </button>

      {/* Popover */}
      {open && (
        <div
          className={
            "absolute z-[70] mt-2 w-[280px] bg-white rounded-2xl shadow-xl border border-line p-4 text-ink " +
            (variant === "row" ? "left-0 right-0 mx-auto" : "left-0")
          }
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-dark">Where should we deliver?</p>
            <button onClick={() => setOpen(false)} aria-label="Close" className="text-ink-muted hover:text-dark">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              save(input);
            }}
          >
            <div className="flex gap-2">
              <input
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter postcode or city"
                className="flex-1 h-10 px-3 rounded-xl border border-line text-sm text-dark focus:outline-none focus:border-dark"
              />
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors"
              >
                Set
              </button>
            </div>
          </form>

          <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted mt-4 mb-2">Popular cities</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PICKS.map((city) => (
              <button
                key={city}
                onClick={() => save(city)}
                className={
                  "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors " +
                  (value === city
                    ? "bg-dark text-white border-dark"
                    : "bg-white text-ink-soft border-line hover:border-dark hover:text-dark")
                }
              >
                {value === city && <Check className="w-3 h-3" />}
                {city}
              </button>
            ))}
          </div>

          <p className="text-[11px] text-ink-muted mt-4">
            We deliver across the UK in 24–48 hours.
          </p>
        </div>
      )}
    </div>
  );
}
