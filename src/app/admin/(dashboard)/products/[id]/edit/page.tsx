"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("products")
      .select("*")
      .eq("id", params.id as string)
      .single()
      .then(({ data }) => {
        if (data) setProduct(data);
        else setNotFound(true);
      });
  }, [params.id]);

  if (notFound) {
    return (
      <div className="max-w-2xl">
        <p className="text-sm text-ink-muted mb-4">Product not found.</p>
        <a href="/admin/products" className="text-sm text-dark underline">Back to products</a>
      </div>
    );
  }

  if (!product) {
    return <p className="text-sm text-ink-muted">Loading…</p>;
  }

  return <ProductForm mode="edit" product={product} />;
}
