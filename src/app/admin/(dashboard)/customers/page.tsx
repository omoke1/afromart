import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const PER_PAGE = 20;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageStr } = await searchParams;
  const page = Math.max(1, parseInt(pageStr ?? "1", 10) || 1);

  const supabase = await createServerSupabase();

  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const { data, count } = await supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const profiles = (data ?? []) as {
    id: string;
    name: string;
    email: string;
    created_at: string;
  }[];

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  function pageUrl(p: number) {
    return `/admin/customers?page=${p}`;
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-dark mb-6">Customers</h2>

      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted text-xs border-b border-[#e6e1d6]">
              <th className="py-3 px-4 font-medium">Name</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Joined</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e1d6]/50">
            {profiles.map((p) => (
              <tr key={p.id} className="hover:bg-[#fafaf7]">
                <td className="py-3 px-4 font-medium text-dark">{p.name ?? "—"}</td>
                <td className="py-3 px-4 text-ink-soft">{p.email ?? "—"}</td>
                <td className="py-3 px-4 text-ink-soft">
                  {new Date(p.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/admin/customers/${p.id}`}
                    className="text-xs text-ink-soft hover:text-dark"
                  >
                    View →
                  </Link>
                </td>
              </tr>
            ))}
            {!profiles.length && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-ink-muted">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-ink-muted">
            {total} customers · Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={pageUrl(page - 1)}
                className="h-8 px-3 rounded-lg border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-white transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </Link>
            ) : (
              <span className="h-8 px-3 rounded-lg border border-[#e6e1d6] text-xs font-medium text-ink-muted opacity-40 flex items-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </span>
            )}
            {page < totalPages ? (
              <Link
                href={pageUrl(page + 1)}
                className="h-8 px-3 rounded-lg border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-white transition-colors flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <span className="h-8 px-3 rounded-lg border border-[#e6e1d6] text-xs font-medium text-ink-muted opacity-40 flex items-center gap-1">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
