import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];

export async function getRecipes(): Promise<RecipeRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("recipes").select("*").order("title");
  return data ?? [];
}

export async function getRecipe(slug: string): Promise<RecipeRow | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("recipes").select("*").eq("slug", slug).single();
  return data;
}

export async function getRecipeById(id: string): Promise<RecipeRow | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("recipes").select("*").eq("id", id).single();
  return data;
}

// Admin operations
export async function adminCreateRecipe(input: Database["public"]["Tables"]["recipes"]["Insert"]): Promise<RecipeRow> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("recipes").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function adminUpdateRecipe(id: string, input: Database["public"]["Tables"]["recipes"]["Update"]): Promise<RecipeRow> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("recipes").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function adminDeleteRecipe(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("recipes").delete().eq("id", id);
  if (error) throw error;
}
