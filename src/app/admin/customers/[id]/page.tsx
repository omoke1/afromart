import { createServerSupabase } from "@/lib/supabase/server";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabase();

  const profileRaw = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
  const profile = profileRaw.data as { name: string; email: string; created_at: string } | null;

  const ordersRaw = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", id)
    .order("created_at", { ascending: false });
  const orders = (ordersRaw.data ?? []) as { id: string; total: number; status: string; created_at: string }[];

  if (!profile) {
    return <p className="text-sm text-ink-muted">Customer not found.</p>;
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-dark">{profile.name ?? "Unnamed customer"}</h2>
        <p className="text-sm text-ink-soft">{profile.email}</p>
        <p className="text-xs text-ink-muted mt-1">
          Joined {new Date(profile.created_at).toLocaleDateString("en-GB", {
            day: "numeric", month: "long", year: "numeric",
          })}
        </p>
      </div>

      <h3 className="text-sm font-semibold text-dark mb-4">Order history</h3>

      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted text-xs border-b border-[#e6e1d6]">
              <th className="py-3 px-4 font-medium">Order</th>
              <th className="py-3 px-4 font-medium">Date</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e1d6]/50">
            {orders?.map((o) => (
              <tr key={o.id}>
                <td className="py-3 px-4 font-medium text-dark">{o.id}</td>
                <td className="py-3 px-4 text-ink-soft">
                  {new Date(o.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  <StatusBadge status={o.status} />
                </td>
                <td className="py-3 px-4 text-right text-dark">£{Number(o.total).toFixed(2)}</td>
              </tr>
            ))}
            {!orders?.length && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-sm text-ink-muted">
                  No orders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Delivered: "text-green bg-green/10",
    "Out for delivery": "text-blue bg-blue/10",
    Preparing: "text-amber bg-amber/10",
    Cancelled: "text-red bg-red/10",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors[status] ?? "text-ink-muted bg-[#f4f1ea]"}`}>
      {status}
    </span>
  );
}
