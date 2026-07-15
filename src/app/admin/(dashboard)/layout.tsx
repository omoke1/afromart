import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import AdminSidebar from "@/components/admin/AdminSidebar";

// This layout lives in the (dashboard) route group, so it wraps every admin
// page EXCEPT /admin/login — the login page must never run this auth check,
// otherwise redirecting to it loops forever.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const admin = createAdminClient();
  const { data: role } = await admin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!role) {
    // Signed in but not an admin — send them to the shop, not back to the
    // admin login page (they're already authenticated; that would loop).
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-[#e6e1d6] bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold text-dark">AfroMart Admin</h1>
          </div>
          <div className="flex items-center gap-3 text-xs text-ink-soft">
            <span>{user.email}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green" />
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
