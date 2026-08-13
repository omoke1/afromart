import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/client";
import type { Database, Json } from "@/lib/supabase/types";

type OrderRow = Database["public"]["Tables"]["orders"]["Row"];
type OrderItemRow = Database["public"]["Tables"]["order_items"]["Row"];

export type OrderWithItems = OrderRow & { items: OrderItemRow[] };

export async function getOrders(): Promise<OrderRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function getOrder(id: string): Promise<OrderWithItems | null> {
  const supabase = await createServerSupabase();
  const { data: order } = await supabase.from("orders").select("*").eq("id", id).single();
  if (!order) return null;
  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", id);
  return { ...order, items: items ?? [] };
}

export async function getUserOrders(userId: string): Promise<OrderRow[]> {
  const supabase = await createServerSupabase();
  const { data } = await supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  return data ?? [];
}

// Orders are created server-side by /api/checkout, which re-verifies prices
// and attaches the signed-in user from the session cookie. There is
// deliberately no client-side createOrder here.

// Admin operations
export async function adminGetOrders(): Promise<OrderWithItems[]> {
  const admin = createAdminClient();
  const { data: orders } = await admin.from("orders").select("*").order("created_at", { ascending: false });
  if (!orders) return [];
  const { data: items } = await admin.from("order_items").select("*");
  const itemsByOrder = new Map<string, OrderItemRow[]>();
  for (const item of items ?? []) {
    if (!itemsByOrder.has(item.order_id)) itemsByOrder.set(item.order_id, []);
    itemsByOrder.get(item.order_id)!.push(item);
  }
  return orders.map((o) => ({ ...o, items: itemsByOrder.get(o.id) ?? [] }));
}

export async function adminGetOrder(id: string): Promise<OrderWithItems | null> {
  const admin = createAdminClient();
  const { data: order } = await admin.from("orders").select("*").eq("id", id).single();
  if (!order) return null;
  const { data: items } = await admin.from("order_items").select("*").eq("order_id", id);
  return { ...order, items: items ?? [] };
}

export async function adminUpdateOrderStatus(id: string, status: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
}
