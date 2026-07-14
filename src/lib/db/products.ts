import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type ProductRow = Database["public"]["Tables"]["products"]["Row"];

export async function getProducts(): Promise<ProductRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("products").select("*").order("name");
  return data ?? [];
}

export async function getActiveProducts(): Promise<ProductRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("name");
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

export async function getFeaturedProducts(): Promise<ProductRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("featured_position")
    .order("name");
  return data ?? [];
}

export async function getNewArrivals(limit = 8): Promise<ProductRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getBestSellers(limit = 10): Promise<ProductRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("order_items")
    .select("product_id, qty")
    .order("qty", { ascending: false });
  if (!data) return [];

  const qtyMap = new Map<string, number>();
  for (const row of data) {
    qtyMap.set(row.product_id, (qtyMap.get(row.product_id) ?? 0) + row.qty);
  }

  const sortedIds = [...qtyMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (sortedIds.length === 0) return [];

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .in("id", sortedIds);

  const productMap = new Map((products ?? []).map((p) => [p.id, p]));
  return sortedIds.map((id) => productMap.get(id)).filter(Boolean) as ProductRow[];
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
