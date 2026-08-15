import Link from "next/link";
import { ChevronRight } from "lucide-react";
import AccountSidebar from "@/components/layout/AccountSidebar";
import { getServerUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import NotificationList from "./NotificationList";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getServerUser();
  if (!user) return null;

  const admin = createAdminClient();
  const [{ data: notificationsRaw }, { count: unread }] = await Promise.all([
    admin
      .from("notifications")
      .select("*")
      .eq("scope", "user")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    admin
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("scope", "user")
      .eq("user_id", user.id)
      .eq("is_read", false),
  ]);

  const notifications = (notificationsRaw ?? []) as {
    id: string;
    type: string;
    title: string;
    body: string;
    link: string | null;
    is_read: boolean;
    created_at: string;
  }[];
  const unreadCount = unread ?? 0;

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
      <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8 flex-wrap">
        <Link href="/" className="hover:text-dark">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/account" className="hover:text-dark">Account</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-dark">Notifications</span>
      </nav>

      <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Account</p>
      <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">Notifications</h1>
      <p className="mt-2 text-ink-soft text-sm">
        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.` : "You're all caught up."}
      </p>

      <div className="mt-10 grid lg:grid-cols-[240px_1fr] gap-10">
        <AccountSidebar />
        <NotificationList initial={notifications} />
      </div>
    </div>
  );
}
