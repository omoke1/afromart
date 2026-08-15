import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const STALE_AFTER_HOURS = 6;
const RECENT_ORDER_WINDOW_HOURS = 48;
const REMIND_COOLDOWN_DAYS = 14;

// Hourly cron (see /vercel.json) that emails signed-in customers who left items
// in their cart more than a few hours ago without checking out.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const now = Date.now();

  const { data: cartRows } = await admin
    .from("cart_items")
    .select("user_id, qty, products(name)")
    .lt("updated_at", new Date(now - STALE_AFTER_HOURS * 3600 * 1000).toISOString());

  if (!cartRows || cartRows.length === 0) {
    return NextResponse.json({ sent: 0 });
  }

  const byUser = new Map<string, { name: string; qty: number }[]>();
  for (const row of cartRows) {
    const productName = (row.products as { name?: string } | null)?.name ?? "Item";
    const existing = byUser.get(row.user_id) ?? [];
    const idx = existing.findIndex((i) => i.name === productName);
    if (idx >= 0) existing[idx].qty += row.qty;
    else existing.push({ name: productName, qty: row.qty });
    byUser.set(row.user_id, existing);
  }

  const userIds = Array.from(byUser.keys());
  if (userIds.length === 0) return NextResponse.json({ sent: 0 });

  const recentOrderSet = new Set<string>();
  const { data: recentOrders } = await admin
    .from("orders")
    .select("user_id")
    .in("user_id", userIds)
    .gte("created_at", new Date(now - RECENT_ORDER_WINDOW_HOURS * 3600 * 1000).toISOString());
  for (const o of recentOrders ?? []) if (o.user_id) recentOrderSet.add(o.user_id);

  const remindedSet = new Set<string>();
  const { data: reminders } = await admin
    .from("cart_reminders")
    .select("user_id")
    .in("user_id", userIds)
    .gte("sent_at", new Date(now - REMIND_COOLDOWN_DAYS * 24 * 3600 * 1000).toISOString());
  for (const r of reminders ?? []) remindedSet.add(r.user_id);

  const targets = userIds.filter((id) => !recentOrderSet.has(id) && !remindedSet.has(id));
  if (targets.length === 0) return NextResponse.json({ sent: 0 });

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, name")
    .in("id", targets);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.afromart.xyz";
  let sent = 0;

  for (const profile of profiles ?? []) {
    if (!profile.email) continue;
    const items = byUser.get(profile.id) ?? [];
    try {
      const { sendAbandonedCartEmail } = await import("@/lib/email");
      await sendAbandonedCartEmail({
        to: profile.email,
        customerName: profile.name ?? "there",
        items,
        link: `${siteUrl}/cart`,
      });
      await admin.from("cart_reminders").insert({ user_id: profile.id });
      sent += 1;
    } catch (err) {
      console.error("abandoned cart email failed:", err);
    }
  }

  return NextResponse.json({ sent });
}
