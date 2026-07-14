"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/lib/cart";

export default function ReorderButton({ items }: { items: { product_id: string; qty: number }[] }) {
  const { add } = useCart();
  const router = useRouter();

  function handleReorder() {
    for (const item of items) {
      add(item.product_id, item.qty);
    }
    router.push("/cart");
  }

  return (
    <button
      onClick={handleReorder}
      className="mt-8 h-11 px-5 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors flex items-center gap-2"
    >
      <ShoppingCart className="w-4 h-4" />
      Re-order everything
    </button>
  );
}
