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

// Client-side: create order
export async function createOrder(input: {
  id: string;
  subtotal: number;
  delivery: number;
  total: number;
  address: Record<string, unknown>;
  items: { product_id: string; qty: number; unit_price: number }[];
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: order, error: orderError } = await supabase.from("orders").insert({
    id: input.id,
    user_id: user?.id ?? null,
    subtotal: input.subtotal,
    delivery: input.delivery,
    total: input.total,
    address: input.address as Json,
    status: "Preparing",
  }).select().single();

  if (orderError) throw orderError;

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((item) => ({
      order_id: order.id,
      ...item,
    }))
  );

  if (itemsError) throw itemsError;

  return order;
}

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
