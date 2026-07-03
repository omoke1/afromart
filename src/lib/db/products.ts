import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export async function getProducts(): Promise<ProductRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("products").select("*").order("name");
  return data ?? [];
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("products").select("*").eq("id", id).single();
  return data;
}

export async function getProductsByCategory(categoryId: string): Promise<ProductRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("products").select("*").eq("category_id", categoryId).order("name");
  return data ?? [];
}

export async function getLowStockProducts(threshold = 10): Promise<ProductRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("products").select("*").lte("stock", threshold).order("stock");
  return data ?? [];
}

// Admin operations
export async function adminCreateProduct(input: Database["public"]["Tables"]["products"]["Insert"]): Promise<ProductRow> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("products").insert(input).select().single();
  if (error) throw error;
  return data;
}

export async function adminUpdateProduct(id: string, input: Database["public"]["Tables"]["products"]["Update"]): Promise<ProductRow> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("products").update(input).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function adminDeleteProduct(id: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) throw error;
}
