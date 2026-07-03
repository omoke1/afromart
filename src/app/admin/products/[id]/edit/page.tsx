"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [product, setProduct] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("categories").select("id, name").order("name").then(({ data }) => {
      if (data) setCategories(data as { id: string; name: string }[]);
    });
    supabase.from("products").select("*").eq("id", params.id as string).single().then(({ data: raw }) => {
      const data = raw as Record<string, unknown> | null;
      if (data) setProduct(data);
    });
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      category_id: form.get("category_id") as string,
      weight: form.get("weight") as string,
      price: parseFloat(form.get("price") as string),
      compare_at: form.get("compare_at") ? parseFloat(form.get("compare_at") as string) : null,
      emoji: form.get("emoji") as string,
      bg_color: form.get("bg_color") as string,
      badge: (form.get("badge") as string) || null,
      description: form.get("description") as string,
      origin: (form.get("origin") as string) || null,
      stock: parseInt(form.get("stock") as string) || 0,
    };

    const supabase = createClient();
    const { error } = await supabase.from("products").update(data as never).eq("id", params.id as string);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  if (!product) return <p className="text-sm text-ink-muted">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-dark mb-6">Edit product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" name="name" defaultValue={product.name as string} required />
          <Field label="Emoji" name="emoji" defaultValue={product.emoji as string} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Category" name="category_id" value={product.category_id as string} required options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          <Field label="Weight" name="weight" defaultValue={product.weight as string} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Price (£)" name="price" type="number" step="0.01" defaultValue={String(product.price)} required />
          <Field label="Compare at (£)" name="compare_at" type="number" step="0.01" defaultValue={product.compare_at ? String(product.compare_at) : ""} />
          <Field label="Stock" name="stock" type="number" defaultValue={String(product.stock)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Background color" name="bg_color" defaultValue={product.bg_color as string} />
          <SelectField label="Badge" name="badge" value={product.badge as string ?? ""} options={[
            { value: "", label: "None" },
            { value: "promo", label: "Promo" },
            { value: "best-seller", label: "Best Seller" },
            { value: "new", label: "New" },
          ]} />
        </div>

        <Field label="Origin" name="origin" defaultValue={product.origin as string ?? ""} />

        <label className="block">
          <span className="block text-xs font-medium text-ink-soft mb-1.5">Description</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={product.description as string}
            className="w-full px-4 py-2.5 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark resize-none"
          />
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-6 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Update product"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="h-10 px-6 rounded-full border border-[#e6e1d6] text-dark text-xs font-semibold hover:bg-[#f4f1ea] transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  step,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        step={step}
        className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
      />
    </label>
  );
}

function SelectField({
  label,
  name,
  required,
  options,
  value,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: { value: string; label: string }[];
  value?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <select
        name={name}
        required={required}
        defaultValue={value}
        className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
