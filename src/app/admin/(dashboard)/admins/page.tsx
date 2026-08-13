"use client";

import { useCallback, useEffect, useState } from "react";
import { Shield, UserPlus } from "lucide-react";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { useToast } from "@/components/ui/ToastProvider";

type Admin = {
  id: string;
  role: string;
  user_id: string;
  created_at: string;
  profiles: { name: string | null; email: string } | null;
};

export default function AdminAdminsPage() {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const [adminsRes, meRes] = await Promise.all([
      fetch("/api/admin/admins"),
      fetch("/api/auth/me"),
    ]);
    const adminsData = await adminsRes.json();
    const meData = await meRes.json();
    setAdmins((adminsData.admins ?? []) as Admin[]);
    setCurrentUserId((meData.user?.id as string) ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAdding(true);
    const res = await fetch("/api/admin/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json().catch(() => ({}));
    setAdding(false);
    if (!res.ok) {
      toast(data.error ?? "Could not add admin.", "error");
      return;
    }
    toast(`Added ${email} as admin.`);
    setEmail("");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark">Admins</h2>
      </div>

      <form
        onSubmit={handleAdd}
        className="bg-white border border-[#e6e1d6] rounded-xl p-5 mb-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-ink-muted" />
          <h3 className="text-sm font-semibold text-dark">Add an admin</h3>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <label className="block flex-1 min-w-52">
            <span className="block text-xs text-ink-soft mb-1.5">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="person@example.com"
              className="w-full h-9 px-3 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white focus:outline-none focus:border-dark"
            />
          </label>
          <label className="block">
            <span className="block text-xs text-ink-soft mb-1.5">Role</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-9 px-3 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white"
            >
              <option value="admin">Admin</option>
              <option value="superadmin">Superadmin</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={adding}
            className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors disabled:opacity-50"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {adding ? "Adding…" : "Add admin"}
          </button>
        </div>
        <p className="text-xs text-ink-muted mt-3">
          The person must already have a shop account (they need to sign in once). Roles are
          informational for now — any admin here gets full dashboard access.
        </p>
      </form>

      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted text-xs border-b border-[#e6e1d6]">
              <th className="py-3 px-4 font-medium">Name</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Role</th>
              <th className="py-3 px-4 font-medium">Added</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e1d6]/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-ink-muted">
                  Loading…
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-ink-muted">
                  No admins yet.
                </td>
              </tr>
            ) : (
              admins.map((a) => (
                <tr key={a.id} className="hover:bg-[#fafaf7]">
                  <td className="py-3 px-4 font-medium text-dark">
                    {a.profiles?.name ?? "—"}{" "}
                    {a.user_id === currentUserId && (
                      <span className="text-xs font-medium text-brand">(you)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-ink-soft">{a.profiles?.email ?? "—"}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#f4f1ea] text-ink-soft">
                      {a.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-ink-soft">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {a.user_id === currentUserId ? (
                      <span className="text-xs text-ink-muted">—</span>
                    ) : (
                      <ConfirmDeleteButton
                        endpoint={`/api/admin/admins/${a.id}`}
                        confirmTitle="Remove admin?"
                        confirmBody={`Remove ${a.profiles?.email ?? "this person"} from the admin team?`}
                        onDeleted={load}
                      />
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
