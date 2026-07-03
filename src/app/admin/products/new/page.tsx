"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  useState(() => {
    createClient()
      .from("categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        if (data) setCategories(data as { id: string; name: string }[]);
      });
  });

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
    const { error } = await supabase.from("products").insert(data as never);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-dark mb-6">New product</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" name="name" required />
          <Field label="Emoji" name="emoji" defaultValue="📦" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField label="Category" name="category_id" required options={categories.map((c) => ({ value: c.id, label: c.name }))} />
          <Field label="Weight (e.g. 5 kg)" name="weight" defaultValue="1 kg" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Price (£)" name="price" type="number" step="0.01" required />
          <Field label="Compare at (£)" name="compare_at" type="number" step="0.01" />
          <Field label="Stock" name="stock" type="number" defaultValue="0" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Background color" name="bg_color" defaultValue="#f4f1ea" />
          <SelectField label="Badge" name="badge" options={[
            { value: "", label: "None" },
            { value: "promo", label: "Promo" },
            { value: "best-seller", label: "Best Seller" },
            { value: "new", label: "New" },
          ]} />
        </div>

        <Field label="Origin" name="origin" />

        <label className="block">
          <span className="block text-xs font-medium text-ink-soft mb-1.5">Description</span>
          <textarea
            name="description"
            rows={3}
            className="w-full px-4 py-2.5 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark resize-none"
          />
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="h-10 px-6 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save product"}
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
}: {
  label: string;
  name: string;
  required?: boolean;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <select
        name={name}
        required={required}
        className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}
