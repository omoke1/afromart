import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function isAdmin(userId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_roles")
    .select("role")
    .eq("user_id", userId)
    .single();
  return data !== null;
}

export async function getCurrentAdmin() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data: role } = await admin
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (!role) return null;

  return {
    id: user.id,
    email: user.email,
    role: role.role,
  };
}
