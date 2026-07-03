import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

export default async function AdminProductsPage() {
  const supabase = await createServerSupabase();

  const productsRaw = await supabase
    .from("products")
    .select("*, categories:category_id(name)")
    .order("name");
  const products = (productsRaw.data ?? []) as { id: string; emoji: string; name: string; categories: { name: string } | null; price: number; stock: number; badge: string | null }[];

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

      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted text-xs border-b border-[#e6e1d6]">
              <th className="py-3 px-4 font-medium">Product</th>
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium">Price</th>
              <th className="py-3 px-4 font-medium">Stock</th>
              <th className="py-3 px-4 font-medium">Badge</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e1d6]/50">
            {products?.map((p) => (
              <tr key={p.id} className="hover:bg-[#fafaf7]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{p.emoji}</span>
                    <span className="text-dark font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-ink-soft">
                  {(p.categories as { name: string } | null)?.name ?? "—"}
                </td>
                <td className="py-3 px-4 text-dark">£{Number(p.price).toFixed(2)}</td>
                <td className="py-3 px-4">
                  <span className={p.stock <= 10 ? "text-red font-medium" : "text-ink-soft"}>
                    {p.stock}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {p.badge ? (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#f4f1ea] text-ink-soft">
                      {p.badge}
                    </span>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-dark"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {!products?.length && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-ink-muted">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
