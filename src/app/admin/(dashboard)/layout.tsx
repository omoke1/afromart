import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerUser } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/ui/ToastProvider";

// This layout lives in the (dashboard) route group, so it wraps every admin
// page EXCEPT /admin/login — the login page must never run this auth check,
// otherwise redirecting to it loops forever.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerUser();

  if (!user) {
    redirect("/admin/login");
  }

  if (!user.isAdmin) {
    // Signed in but not an admin — send them to the shop, not back to the
    // admin login page (they're already authenticated; that would loop).
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 border-b border-[#e6e1d6] bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3 pl-12 lg:pl-0">
            <h1 className="text-sm font-semibold text-dark">AfroMart Admin</h1>
          </div>
          <div className="flex items-center gap-4 text-xs text-ink-soft">
            <Link
              href="/"
              target="_blank"
              className="font-medium text-brand hover:underline"
            >
              View shop ↗
            </Link>
            <span className="text-dark font-medium">{user.name ?? user.email}</span>
          </div>
        </header>
        <main className="flex-1 p-6">
          <ToastProvider>{children}</ToastProvider>
        </main>
      </div>
    </div>
  );
}
