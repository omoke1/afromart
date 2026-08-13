"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Search } from "lucide-react";

type PickerProduct = {
  id: string;
  name: string;
  emoji: string | null;
  image_url: string | null;
  is_active: boolean;
};

export function RelatedProductsPicker({
  defaultIds,
  excludeId,
  onChange,
}: {
  defaultIds: string[];
  excludeId?: string;
  onChange: (ids: string[]) => void;
}) {
  const [products, setProducts] = useState<PickerProduct[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultIds));
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products?all=true")
      .then((r) => r.json())
      .then((data) => {
        if (data.products) setProducts(data.products);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setSelected(new Set(defaultIds));
  }, [defaultIds]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products.filter(
      (p) => p.id !== excludeId && (!needle || p.name.toLowerCase().includes(needle))
    );
  }, [products, q, excludeId]);

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelected(next);
    onChange(Array.from(next));
  }

  const selectedNames = products.filter((p) => selected.has(p.id));

  return (
    <div className="border border-[#e6e1d6] rounded-xl p-4 space-y-3">
      <div>
        <span className="block text-xs font-semibold text-dark">Related products</span>
        <span className="block text-[11px] text-ink-muted mt-0.5">
          Products shown as &ldquo;You may also like&rdquo; on the shop. Leave empty to fall back to
          same-category products.
        </span>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-full h-9 pl-9 pr-3 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
        />
      </div>

      {loading ? (
        <p className="text-sm text-ink-muted py-1">Loading products…</p>
      ) : (
        <div className="max-h-52 overflow-y-auto space-y-1">
          {filtered.length === 0 && (
            <p className="text-sm text-ink-muted py-1">No products match.</p>
          )}
          {filtered.map((p) => {
            const isSelected = selected.has(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm hover:bg-[#f4f1ea] transition-colors"
              >
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? "bg-dark border-dark text-white" : "border-[#d9d3c7]"
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </span>
                <span className="flex-1 truncate text-dark">
                  {p.name}
                  {!p.is_active && <span className="text-ink-muted text-xs"> (inactive)</span>}
                </span>
                <span className="text-lg">{p.emoji}</span>
              </button>
            );
          })}
        </div>
      )}

      {selectedNames.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {selectedNames.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => toggle(p.id)}
              className="flex items-center gap-1.5 h-7 px-3 rounded-full bg-[#f4f1ea] text-xs font-medium text-dark hover:bg-[#e6e1d6] transition-colors"
            >
              {p.emoji} {p.name}
              <span className="text-ink-muted">×</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
