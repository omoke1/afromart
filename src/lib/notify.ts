import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationType =
  | "new_order"
  | "payment_confirmed"
  | "order_status"
  | "refund"
  | "low_stock"
  | "new_customer"
  | "info";

type NotificationInput = {
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
};

// Admin-scoped notification: visible to every admin. user_id stays null.
export async function notifyAdmins(input: NotificationInput): Promise<void> {
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    scope: "admin",
    type: input.type,
    title: input.title,
    body: input.body ?? "",
    link: input.link ?? null,
  });
}

// User-scoped notification: visible only to the given profile.
export async function notifyUser(
  userId: string,
  input: NotificationInput,
): Promise<void> {
  const admin = createAdminClient();
  await admin.from("notifications").insert({
    scope: "user",
    user_id: userId,
    type: input.type,
    title: input.title,
    body: input.body ?? "",
    link: input.link ?? null,
  });
}

// Fetches the email addresses of every admin (for email alerting).
export async function getAdminEmails(): Promise<string[]> {
  const admin = createAdminClient();
  const { data: roles } = await admin.from("admin_roles").select("user_id");
  if (!roles || roles.length === 0) return [];

  const ids = roles.map((r) => r.user_id);
  const { data: profiles } = await admin
    .from("profiles")
    .select("email")
    .in("id", ids);

  return (profiles ?? [])
    .map((p) => p.email)
    .filter((e): e is string => !!e);
}
