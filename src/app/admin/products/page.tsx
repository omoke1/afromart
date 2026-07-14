"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const PER_PAGE = 20;

type Product = {
  id: string;
  name: string;
  emoji: string;
  image_url: string;
  category_id: string;
  price: number;
  stock: number;
  badge: string | null;
  is_active: boolean;
  is_featured: boolean;
};

type Category = { id: string; name: string };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [badgeFilter, setBadgeFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("products").select("id, name, emoji, image_url, category_id, price, stock, badge, is_active, is_featured").order("name"),
      supabase.from("categories").select("id, name").order("name"),
    ]).then(([prodRes, catRes]) => {
      setProducts((prodRes.data ?? []) as Product[]);
      setCategories((catRes.data ?? []) as Category[]);
      setLoading(false);
    });
  }, []);

  const catMap = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (catFilter !== "all" && p.category_id !== catFilter) return false;
      if (badgeFilter !== "all" && p.badge !== badgeFilter) return false;
      if (stockFilter === "low" && p.stock > 10) return false;
      if (stockFilter === "out" && p.stock > 0) return false;
      if (activeFilter === "active" && !p.is_active) return false;
      if (activeFilter === "inactive" && p.is_active) return false;
      return true;
    });
  }, [products, query, catFilter, badgeFilter, stockFilter, activeFilter]);

  const totalPages = Math.max(1, Math.ceil(visible.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = visible.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  async function handleDelete() {
    if (!deleteId) return;
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", deleteId);
    setProducts((prev) => prev.filter((p) => p.id !== deleteId));
    setDeleteId(null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark">Products</h2>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products…"
            className="h-9 pl-9 pr-4 w-56 border border-[#e6e1d6] rounded-full text-sm text-dark bg-white focus:outline-none focus:border-dark"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="h-9 px-3 border border-[#e6e1d6] rounded-full text-xs text-dark bg-white"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select
          value={badgeFilter}
          onChange={(e) => setBadgeFilter(e.target.value)}
          className="h-9 px-3 border border-[#e6e1d6] rounded-full text-xs text-dark bg-white"
        >
          <option value="all">All badges</option>
          <option value="promo">Promo</option>
          <option value="best-seller">Best Seller</option>
          <option value="new">New</option>
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="h-9 px-3 border border-[#e6e1d6] rounded-full text-xs text-dark bg-white"
        >
          <option value="all">All stock</option>
          <option value="low">Low stock (≤10)</option>
          <option value="out">Out of stock</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="h-9 px-3 border border-[#e6e1d6] rounded-full text-xs text-dark bg-white"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted text-xs border-b border-[#e6e1d6]">
              <th className="py-3 px-4 font-medium">Product</th>
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium">Price</th>
              <th className="py-3 px-4 font-medium">Stock</th>
              <th className="py-3 px-4 font-medium">Badge</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e1d6]/50">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-ink-muted">Loading…</td></tr>
            ) : paged.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-ink-muted">No products found.</td></tr>
            ) : (
              paged.map((p) => (
                <tr key={p.id} className="hover:bg-[#fafaf7]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image_url} alt="" className="w-8 h-8 rounded-lg object-cover bg-[#f4f1ea]" />
                      ) : (
                        <span className="text-lg">{p.emoji}</span>
                      )}
                      <span className="text-dark font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-ink-soft">{catMap.get(p.category_id) ?? "—"}</td>
                  <td className="py-3 px-4 text-dark">£{Number(p.price).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={p.stock <= 10 ? "text-red font-medium" : "text-ink-soft"}>{p.stock}</span>
                  </td>
                  <td className="py-3 px-4">
                    {p.badge ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#f4f1ea] text-ink-soft">{p.badge}</span>
                    ) : (
                      <span className="text-ink-muted">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${p.is_active ? "bg-green/10 text-green" : "bg-red/10 text-red"}`}>
                      {p.is_active ? "Active" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-dark"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Link>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="inline-flex items-center gap-1 text-xs text-red/70 hover:text-red"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-ink-muted">
            {visible.length} products · Page {safePage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {safePage > 1 ? (
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-8 px-3 rounded-lg border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-white transition-colors flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
            ) : (
              <span className="h-8 px-3 rounded-lg border border-[#e6e1d6] text-xs font-medium text-ink-muted opacity-40 flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </span>
            )}
            {safePage < totalPages ? (
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="h-8 px-3 rounded-lg border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-white transition-colors flex items-center gap-1">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="h-8 px-3 rounded-lg border border-[#e6e1d6] text-xs font-medium text-ink-muted opacity-40 flex items-center gap-1">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-dark mb-2">Delete product?</h3>
            <p className="text-sm text-ink-soft mb-6">
              This will permanently remove the product from the shop. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="h-9 px-4 rounded-full border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-[#f4f1ea] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="h-9 px-4 rounded-full bg-red text-white text-xs font-semibold hover:bg-red/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
