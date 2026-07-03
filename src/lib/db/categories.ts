import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

export async function getCategories(): Promise<CategoryRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("categories").select("*").order("name");
  return data ?? [];
}

export async function getCategory(slug: string): Promise<CategoryRow | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("categories").select("*").eq("slug", slug).single();
  return data;
}

export async function getCategoryById(id: string): Promise<CategoryRow | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("categories").select("*").eq("id", id).single();
  return data;
}

// Admin operations
export async function adminCreateCategory(input: Database["public"]["Tables"]["categories"]["Insert"]): Promise<CategoryRow> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("categories").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function adminUpdateCategory(id: string, input: Database["public"]["Tables"]["categories"]["Update"]): Promise<CategoryRow> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("categories").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function adminDeleteCategory(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) throw error;
}
