"use client";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type CartItemRow = Database["public"]["Tables"]["cart_items"]["Row"];

export async function syncCartToSupabase(userId: string, items: { productId: string; qty: number }[]) {
  const supabase = createClient();

  const upserts = items.map((item) => ({
    user_id: userId,
    product_id: item.productId,
    qty: item.qty,
  }));

  const { error } = await supabase.from("cart_items").upsert(upserts, {
    onConflict: "user_id, product_id",
  });

  if (error) throw error;
}

export async function getCartFromSupabase(userId: string): Promise<CartItemRow[]> {
  const supabase = createClient();
  const { data } = await supabase.from("cart_items").select("*").eq("user_id", userId);
  return data ?? [];
}

export async function clearCartOnSupabase(userId: string) {
  const supabase = createClient();
  await supabase.from("cart_items").delete().eq("user_id", userId);
}
