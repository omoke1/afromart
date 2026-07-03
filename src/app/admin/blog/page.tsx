import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";

export default async function AdminBlogPage() {
  const supabase = await createServerSupabase();

  const { data: postsRaw } = await supabase
    .from("blog_posts")
    .select("*")
    .order("date", { ascending: false });

  const posts = (postsRaw ?? []) as { id: string; emoji: string; title: string; category: string; author: string; date: string }[];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark">Blog posts</h2>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New post
        </Link>
      </div>

      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted text-xs border-b border-[#e6e1d6]">
              <th className="py-3 px-4 font-medium">Title</th>
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium">Author</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e1d6]/50">
            {posts?.map((p) => (
              <tr key={p.id} className="hover:bg-[#fafaf7]">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{p.emoji}</span>
                    <span className="text-dark font-medium">{p.title}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#f4f1ea] text-ink-soft">
                    {p.category}
                  </span>
                </td>
                <td className="py-3 px-4 text-ink-soft">{p.author}</td>
                <td className="py-3 px-4 text-ink-soft">{p.date}</td>
                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/admin/blog/${p.id}/edit`}
                    className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-dark"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {!posts?.length && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-ink-muted">
                  No blog posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
