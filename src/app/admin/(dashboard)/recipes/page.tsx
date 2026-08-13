import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Plus, Pencil, ExternalLink } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";

export default async function AdminRecipesPage() {
  const supabase = createAdminClient();

  const recipesRaw = await supabase
    .from("recipes")
    .select("*")
    .order("title");
  const recipes = (recipesRaw.data ?? []) as { id: string; emoji: string; title: string; level: string; time: string; serves: number; slug: string }[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark">Recipes</h2>
        <Link
          href="/admin/recipes/new"
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New recipe
        </Link>
      </div>

      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted text-xs border-b border-[#e6e1d6]">
              <th className="py-3 px-4 font-medium">Title</th>
              <th className="py-3 px-4 font-medium">Level</th>
              <th className="py-3 px-4 font-medium">Time</th>
              <th className="py-3 px-4 font-medium">Serves</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e1d6]/50">
            {recipes?.map((r) => (
              <tr key={r.id} className="hover:bg-[#fafaf7]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{r.emoji}</span>
                    <span className="text-dark font-medium">{r.title}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#f4f1ea] text-ink-soft">
                    {r.level}
                  </span>
                </td>
                <td className="py-3 px-4 text-ink-soft">{r.time}</td>
                <td className="py-3 px-4 text-ink-soft">{r.serves}</td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/recipes/${r.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-dark"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </Link>
                    <Link
                      href={`/admin/recipes/${r.id}/edit`}
                      className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-dark"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </Link>
                    <ConfirmDeleteButton
                      endpoint={`/api/admin/recipes/${r.id}`}
                      confirmTitle="Delete recipe?"
                      confirmBody={`"${r.title}" will be permanently removed.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {!recipes?.length && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-ink-muted">
                  No recipes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
