"use client";

import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/types";

type WishlistItemRow = Database["public"]["Tables"]["wishlist_items"]["Row"];

export async function syncWishlistToSupabase(userId: string, ids: string[]) {
  const supabase = createClient();

  const inserts = ids.map((productId) => ({
    user_id: userId,
    product_id: productId,
  }));

  const { error } = await supabase.from("wishlist_items").upsert(inserts, {
    onConflict: "user_id, product_id",
  });

  if (error) throw error;
}

export async function getWishlistFromSupabase(userId: string): Promise<WishlistItemRow[]> {
  const supabase = createClient();
  const { data } = await supabase.from("wishlist_items").select("*").eq("user_id", userId);
  return data ?? [];
}
