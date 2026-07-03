import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}

export async function getAllProfiles(): Promise<ProfileRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

// Admin operations
export async function adminGetAllProfiles(): Promise<ProfileRow[]> {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("*").order("created_at", { ascending: false });
  return data ?? [];
}
