"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";

export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/products/${params.id as string}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.product) setProduct(data.product);
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
