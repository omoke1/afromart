"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Plus, Trash2 } from "lucide-react";
import { TitleSlugFields } from "@/components/admin/TitleSlugFields";
import { RelatedProductsPicker } from "@/components/admin/RelatedProductsPicker";
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
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(mode === "edit");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      });
  }, []);

  useEffect(() => {
    if (mode === "create" || !product) return;
    fetch(`/api/admin/products/${product?.id as string}`)
      .then((r) => r.json())
      .then((data) => {
        const rows: OptionRow[] = ((data.options ?? []) as {
          id: string;
          weight: string;
          price: number;
          compare_at: number | null;
          stock: number;
        }[]).map((o) => ({
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
        if (Array.isArray(data.related_ids)) setRelatedIds(data.related_ids);
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

    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = await res.json();

    if (!res.ok || !data.url) {
      setError(data.error ?? "Upload failed.");
      setUploading(false);
      return;
    }

    setImageUrl(data.url);
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
      description_long: (form.get("description_long") as string) || "",
      origin: (form.get("origin") as string) || null,
      stock: first.stock,
      image_url: imageUrl || "",
      is_active: form.get("is_active") === "on",
      is_featured: form.get("is_featured") === "on",
      featured_position: parseInt(form.get("featured_position") as string) || 0,
      slug: (form.get("slug") as string) || null,
    };

    const payload = {
      ...data,
      options: rows,
      related_ids: relatedIds,
    };

    const res =
      mode === "edit" && product
        ? await fetch(`/api/admin/products/${product.id as string}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

    const result = await res.json();
    if (!res.ok) {
      setError(result.error ?? "Could not save product.");
      setLoading(false);
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark">
          {mode === "create" ? "New product" : "Edit product"}
        </h2>
        {mode === "edit" && product?.slug ? (
          <a
            href={`/shop/${product.id}`}
            target="_blank"
            className="text-xs font-medium text-brand hover:underline"
          >
            View on site →
          </a>
        ) : null}
      </div>

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

        <TitleSlugFields
          titleName="name"
          titleLabel="Name"
          titleDefault={(product?.name as string) ?? ""}
          slugDefault={(product?.slug as string) ?? ""}
        />

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
          <span className="block text-xs font-medium text-ink-soft mb-1.5">Short description</span>
          <textarea
            name="description"
            rows={2}
            defaultValue={(product?.description as string) ?? ""}
            placeholder="One or two sentences shown under the product name."
            className="w-full px-4 py-2.5 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark resize-none"
          />
        </label>

        <label className="block">
          <span className="block text-xs font-medium text-ink-soft mb-1.5">Full description</span>
          <textarea
            name="description_long"
            rows={6}
            defaultValue={(product?.description_long as string) ?? ""}
            placeholder="Detailed description shown in the product details section. You can use plain text."
            className="w-full px-4 py-2.5 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark resize-y"
          />
        </label>

        {mode === "create" || !optionsLoading ? (
          <RelatedProductsPicker
            defaultIds={relatedIds}
            excludeId={product?.id as string}
            onChange={setRelatedIds}
          />
        ) : null}

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
