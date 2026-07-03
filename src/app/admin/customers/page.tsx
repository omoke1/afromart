import { createServerSupabase } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminCustomersPage() {
  const supabase = await createServerSupabase();

  const profilesRaw = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  const profiles = (profilesRaw.data ?? []) as { id: string; name: string; email: string; created_at: string }[];

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
            {profiles?.map((p) => (
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
            {!profiles?.length && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-sm text-ink-muted">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
