"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Upload, X, Plus, Trash2 } from "lucide-react";

type Category = { id: string; name: string };

type OptionRow = {
  id?: string;
  weight: string;
  price: string;
  compare_at: string;
  stock: string;
};

type Props = {
  mode: "create" | "edit";
  product?: Record<string, unknown>;
};

const emptyOption = (): OptionRow => ({ weight: "1 kg", price: "", compare_at: "", stock: "0" });

export default function ProductForm({ mode, product }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrl, setImageUrl] = useState((product?.image_url as string) ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [optionRows, setOptionRows] = useState<OptionRow[]>(() =>
    mode === "create" ? [emptyOption()] : []
  );
  const [optionsLoading, setOptionsLoading] = useState(mode === "edit");
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

  useEffect(() => {
    if (mode === "create" || !product) return;
    const supabase = createClient();
    supabase
      .from("product_options")
      .select("id, weight, price, compare_at, stock")
      .eq("product_id", product?.id as string)
      .order("position")
      .then(({ data }) => {
        const rows: OptionRow[] = (data ?? []).map((o) => ({
          id: o.id,
          weight: o.weight,
          price: String(o.price),
          compare_at: o.compare_at ? String(o.compare_at) : "",
          stock: String(o.stock),
        }));
        if (rows.length === 0) {
          rows.push({
            id: undefined,
            weight: (product?.weight as string) || "1 kg",
            price: product?.price != null ? String(product.price) : "",
            compare_at: product?.compare_at ? String(product.compare_at) : "",
            stock: String((product?.stock as number) ?? 0),
          });
        }
        setOptionRows(rows);
        setOptionsLoading(false);
      });
  }, [mode, product]);

  const updateRow = (index: number, field: keyof OptionRow, value: string) =>
    setOptionRows((prev) => prev.map((r, idx) => (idx === index ? { ...r, [field]: value } : r)));

  const addRow = () => setOptionRows((prev) => [...prev, emptyOption()]);

  const removeRow = (index: number) =>
    setOptionRows((prev) => prev.filter((_, idx) => idx !== index));

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

    const rows = optionRows.map((r, i) => ({
      weight: r.weight.trim(),
      price: parseFloat(r.price),
      compare_at: r.compare_at.trim() ? parseFloat(r.compare_at) : null,
      stock: parseInt(r.stock, 10) || 0,
      position: i,
    }));

    if (rows.length === 0 || rows.some((r) => !r.weight || Number.isNaN(r.price))) {
      setError("Each option needs a weight and a price.");
      setLoading(false);
      return;
    }

    const form = new FormData(e.currentTarget);
    const first = rows[0];
    const data = {
      name: form.get("name") as string,
      category_id: form.get("category_id") as string,
      weight: first.weight,
      price: first.price,
      compare_at: first.compare_at,
      emoji: (form.get("emoji") as string) || "📦",
      bg_color: (form.get("bg_color") as string) || "#f4f1ea",
      badge: (form.get("badge") as string) || null,
      description: (form.get("description") as string) || "",
      origin: (form.get("origin") as string) || null,
      stock: first.stock,
      image_url: imageUrl || "",
      is_active: form.get("is_active") === "on",
      is_featured: form.get("is_featured") === "on",
      featured_position: parseInt(form.get("featured_position") as string) || 0,
      slug: (form.get("slug") as string) || null,
    };

    const supabase = createClient();
    let productId = (product?.id as string) ?? "";

    if (mode === "edit" && product) {
      const { error } = await supabase.from("products").update(data).eq("id", product.id as string);
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { data: inserted, error } = await supabase
        .from("products")
        .insert(data)
        .select("id")
        .single();
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      productId = inserted.id;
    }

    if (productId) {
      await supabase.from("product_options").delete().eq("product_id", productId);
      const { error: insErr } = await supabase.from("product_options").insert(
        rows.map((r) => ({
          product_id: productId,
          weight: r.weight,
          price: r.price,
          compare_at: r.compare_at,
          stock: r.stock,
          position: r.position,
        }))
      );
      if (insErr) {
        setError(insErr.message);
        setLoading(false);
        return;
      }
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

        <SelectField
          label="Category"
          name="category_id"
          defaultValue={product?.category_id as string}
          required
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />

        {/* Options */}
        <div className="border border-[#e6e1d6] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="block text-xs font-semibold text-dark">Options (sizes / weights)</span>
              <span className="block text-[11px] text-ink-muted mt-0.5">
                The first option is the product&apos;s default. Customers pick from these on the shop.
              </span>
            </div>
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1 h-8 px-3 rounded-full border border-[#e6e1d6] text-xs font-semibold text-dark hover:bg-[#f4f1ea] transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add option
            </button>
          </div>

          {optionsLoading ? (
            <p className="text-sm text-ink-muted py-2">Loading options…</p>
          ) : (
            optionRows.map((row, i) => (
              <div key={row.id ?? i} className="border border-[#e6e1d6] rounded-xl p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-dark">Option {i + 1}</span>
                  {optionRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      aria-label={`Remove option ${i + 1}`}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-ink-muted hover:text-red transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="block text-xs font-medium text-ink-soft mb-1.5">Weight</span>
                    <input
                      type="text"
                      value={row.weight}
                      onChange={(e) => updateRow(i, "weight", e.target.value)}
                      placeholder="e.g. 1 kg"
                      className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-medium text-ink-soft mb-1.5">Price (£)</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.price}
                      onChange={(e) => updateRow(i, "price", e.target.value)}
                      className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-medium text-ink-soft mb-1.5">Compare at (£)</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={row.compare_at}
                      onChange={(e) => updateRow(i, "compare_at", e.target.value)}
                      placeholder="Optional"
                      className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-medium text-ink-soft mb-1.5">Stock</span>
                    <input
                      type="number"
                      min="0"
                      value={row.stock}
                      onChange={(e) => updateRow(i, "stock", e.target.value)}
                      className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
                    />
                  </label>
                </div>
              </div>
            ))
          )}
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
