"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload, X } from "lucide-react";

type Category = { id: string; name: string };

type Props = {
  mode: "create" | "edit";
  product?: Record<string, unknown>;
};

export default function ProductForm({ mode, product }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrl, setImageUrl] = useState((product?.image_url as string) ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    createClient()
      .from("categories")
      .select("id, name")
      .order("name")
      .then(({ data }) => {
        if (data) setCategories(data);
      });
  }, []);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");

    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "png";
    const path = `products/${product?.id ?? Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: true });

    if (uploadErr) {
      setError(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(path);

    setImageUrl(urlData.publicUrl + "?t=" + Date.now());
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name") as string,
      category_id: form.get("category_id") as string,
      weight: form.get("weight") as string,
      price: parseFloat(form.get("price") as string),
      compare_at: form.get("compare_at") ? parseFloat(form.get("compare_at") as string) : null,
      emoji: (form.get("emoji") as string) || "📦",
      bg_color: (form.get("bg_color") as string) || "#f4f1ea",
      badge: (form.get("badge") as string) || null,
      description: (form.get("description") as string) || "",
      origin: (form.get("origin") as string) || null,
      stock: parseInt(form.get("stock") as string) || 0,
      image_url: imageUrl || "",
      is_active: form.get("is_active") === "on",
      is_featured: form.get("is_featured") === "on",
      featured_position: parseInt(form.get("featured_position") as string) || 0,
      slug: (form.get("slug") as string) || null,
    };

    const supabase = createClient();
    let result;

    if (mode === "edit" && product) {
      result = await supabase
        .from("products")
        .update(data)
        .eq("id", product.id as string);
    } else {
      result = await supabase.from("products").insert(data);
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-lg font-semibold text-dark mb-6">
        {mode === "create" ? "New product" : "Edit product"}
      </h2>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Image upload */}
        <label className="block">
          <span className="block text-xs font-medium text-ink-soft mb-1.5">Product image</span>
          <div
            onClick={() => fileRef.current?.click()}
            className="relative w-full h-48 border-2 border-dashed border-[#e6e1d6] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-dark transition-colors overflow-hidden bg-white"
          >
            {imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Product" className="w-full h-full object-contain p-2" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageUrl("");
                    if (fileRef.current) fileRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-dark/70 text-white flex items-center justify-center hover:bg-dark transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-ink-muted mb-2" />
                <span className="text-sm text-ink-muted">
                  {uploading ? "Uploading…" : "Click to upload image"}
                </span>
                <span className="text-xs text-ink-muted mt-1">PNG, JPG, WebP up to 5 MB</span>
              </>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleImage}
            className="hidden"
          />
        </label>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" name="name" defaultValue={product?.name as string} required />
          <Field label="Slug (URL-friendly)" name="slug" defaultValue={product?.slug as string ?? ""} placeholder="auto-generated if empty" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Category"
            name="category_id"
            defaultValue={product?.category_id as string}
            required
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <Field label="Weight (e.g. 5 kg)" name="weight" defaultValue={(product?.weight as string) ?? "1 kg"} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Price (£)" name="price" type="number" step="0.01" defaultValue={product ? String(product.price) : undefined} required />
          <Field label="Compare at (£)" name="compare_at" type="number" step="0.01" defaultValue={product?.compare_at ? String(product.compare_at) : ""} />
          <Field label="Stock" name="stock" type="number" defaultValue={product ? String(product.stock) : "0"} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Field label="Emoji" name="emoji" defaultValue={(product?.emoji as string) ?? "📦"} />
          <Field label="Background color" name="bg_color" defaultValue={(product?.bg_color as string) ?? "#f4f1ea"} />
          <SelectField
            label="Badge"
            name="badge"
            defaultValue={(product?.badge as string) ?? ""}
            options={[
              { value: "", label: "None" },
              { value: "promo", label: "Promo" },
              { value: "best-seller", label: "Best Seller" },
              { value: "new", label: "New" },
            ]}
          />
        </div>

        <Field label="Origin" name="origin" defaultValue={(product?.origin as string) ?? ""} />

        <label className="block">
          <span className="block text-xs font-medium text-ink-soft mb-1.5">Description</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={(product?.description as string) ?? ""}
            className="w-full px-4 py-2.5 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark resize-none"
          />
        </label>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-6 pt-1">
          <Toggle name="is_active" label="Active (visible on shop)" defaultChecked={product ? (product.is_active as boolean) !== false : true} />
          <Toggle name="is_featured" label="Featured on homepage" defaultChecked={product?.is_featured as boolean ?? false} />
          <Field label="Featured position" name="featured_position" type="number" defaultValue={product ? String(product.featured_position ?? 0) : "0"} />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || uploading}
            className="h-10 px-6 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : mode === "create" ? "Save product" : "Update product"}
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
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  step?: string;
  placeholder?: string;
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
        placeholder={placeholder}
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
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="w-4 h-4 rounded border-[#e6e1d6] text-dark focus:ring-dark accent-dark"
      />
      <span className="text-xs font-medium text-ink-soft">{label}</span>
    </label>
  );
}
