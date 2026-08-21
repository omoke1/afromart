"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Plus, Trash2, Clipboard, ImageUp } from "lucide-react";
import { TitleSlugFields } from "@/components/admin/TitleSlugFields";
import { RelatedProductsPicker } from "@/components/admin/RelatedProductsPicker";
import { productPath } from "@/lib/product-url";
type Category = { id: string; name: string; weight_units: string[] };
type Subcategory = { id: string; category_id: string; name: string; slug: string; emoji: string; position: number };

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

const emptyOption = (): OptionRow => ({ weight: "1 kg", price: "", compare_at: "", stock: "" });

export default function ProductForm({ mode, product }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrl, setImageUrl] = useState((product?.image_url as string) ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [optionRows, setOptionRows] = useState<OptionRow[]>(() =>
    mode === "create" ? [emptyOption()] : []
  );
  const [relatedIds, setRelatedIds] = useState<string[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(mode === "edit");
  const [selectedCategoryId, setSelectedCategoryId] = useState((product?.category_id as string) ?? "");
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState((product?.subcategory_id as string) ?? "");
  const fileRef = useRef<HTMLInputElement>(null);
  const [presetUnits, setPresetUnits] = useState<string[]>([]);
  const [newPreset, setNewPreset] = useState("");
  const [stockLabelVisibility, setStockLabelVisibility] = useState(
    (product?.stock_label_visibility as string) ?? "category"
  );

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      });
  }, []);

  useEffect(() => {
    if (!selectedCategoryId) { setSubcategories([]); return; }
    fetch(`/api/admin/subcategories?category_id=${selectedCategoryId}`)
      .then((r) => r.json())
      .then((data) => {
        setSubcategories(data.subcategories ?? []);
      });
  }, [selectedCategoryId]);

  const presetSourceCat = categories.find((c) => c.id === selectedCategoryId);
  const presetSourceKey = `${selectedCategoryId}:${presetSourceCat?.weight_units?.join(",") ?? ""}`;
  const prevPresetSourceKey = useRef(presetSourceKey);
  if (prevPresetSourceKey.current !== presetSourceKey) {
    prevPresetSourceKey.current = presetSourceKey;
    setPresetUnits(presetSourceCat?.weight_units ?? []);
    setNewPreset("");
  }

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
          stock: o.stock != null ? String(o.stock) : "",
        }));
        if (rows.length === 0) {
          rows.push({
            id: undefined,
            weight: (product?.weight as string) || "1 kg",
            price: product?.price != null ? String(product.price) : "",
            compare_at: product?.compare_at ? String(product.compare_at) : "",
            stock: product?.stock != null ? String(product.stock) : "",
          });
        }
        setOptionRows(rows);
        if (Array.isArray(data.related_ids)) setRelatedIds(data.related_ids);
        setOptionsLoading(false);
      });
  }, [mode, product]);

  const handleGlobalPaste = useCallback(
    (e: ClipboardEvent) => {
      const active = document.activeElement;
      if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA")) return;
      const file = e.clipboardData?.files?.[0];
      if (file && file.type.startsWith("image/")) {
        e.preventDefault();
        uploadFile(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    document.addEventListener("paste", handleGlobalPaste);
    return () => document.removeEventListener("paste", handleGlobalPaste);
  }, [handleGlobalPaste]);

  const updateRow = (index: number, field: keyof OptionRow, value: string) =>
    setOptionRows((prev) => prev.map((r, idx) => (idx === index ? { ...r, [field]: value } : r)));

  const addRow = () => setOptionRows((prev) => [...prev, emptyOption()]);

  const removeRow = (index: number) =>
    setOptionRows((prev) => prev.filter((_, idx) => idx !== index));

  const addPreset = () => {
    const val = newPreset.trim();
    if (val && !presetUnits.includes(val)) {
      setPresetUnits([...presetUnits, val]);
      setNewPreset("");
    }
  };

  const quickFill = (u: string) => {
    const emptyIdx = optionRows.findIndex((r) => !r.weight.trim());
    const targetIdx = emptyIdx >= 0 ? emptyIdx : optionRows.length - 1;
    updateRow(targetIdx, "weight", u);
  };

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please paste or drop an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB.");
      return;
    }
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

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  function handlePaste(e: React.ClipboardEvent) {
    const file = e.clipboardData.files?.[0];
    if (file) {
      uploadFile(file);
      return;
    }
    // Fallback: some browsers put raw image data in items instead of files
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const blob = items[i].getAsFile();
        if (blob) {
          uploadFile(blob);
          return;
        }
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const rows = optionRows.map((r, i) => ({
      weight: r.weight.trim(),
      price: parseFloat(r.price),
      compare_at: r.compare_at.trim() ? parseFloat(r.compare_at) : null,
      stock: r.stock.trim() === "" ? null : parseInt(r.stock, 10) || 0,
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
      subcategory_id: (form.get("subcategory_id") as string) || null,
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
      low_stock_threshold: parseInt(form.get("low_stock_threshold") as string) || 5,
      stock_label_visibility: stockLabelVisibility,
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

    const cat = categories.find((c) => c.id === selectedCategoryId);
    if (cat && (cat.weight_units ?? []).join("|") !== presetUnits.join("|")) {
      await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight_units: presetUnits }),
      });
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
            href={productPath({ id: product.id as string, slug: product.slug as string | null })}
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
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            className={`relative w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden bg-white ${
              dragging
                ? "border-dark bg-[#f4f1ea] scale-[1.01]"
                : "border-[#e6e1d6] hover:border-dark"
            }`}
          >
            {imageUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Product" className="w-full h-full object-contain" />
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
                  {uploading
                    ? "Uploading…"
                    : dragging
                      ? "Drop image here"
                      : "Click, paste, or drag an image"}
                </span>
                <span className="text-xs text-ink-muted mt-1">PNG, JPG, WebP up to 5 MB</span>
                <span className="flex items-center gap-3 mt-2 text-[11px] text-ink-muted">
                  <span className="flex items-center gap-1"><Clipboard className="w-3 h-3" /> Ctrl+V</span>
                  <span className="flex items-center gap-1"><ImageUp className="w-3 h-3" /> Drag & drop</span>
                </span>
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

        <label className="block">
          <span className="block text-xs font-medium text-ink-soft mb-1.5">Category</span>
          <select
            name="category_id"
            required
            value={selectedCategoryId}
            onChange={(e) => { setSelectedCategoryId(e.target.value); setSelectedSubcategoryId(""); }}
            className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
          >
            <option value="" disabled>Select category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        {subcategories.length > 0 && (
          <label className="block">
            <span className="block text-xs font-medium text-ink-soft mb-1.5">Subcategory</span>
            <select
              name="subcategory_id"
              value={selectedSubcategoryId}
              onChange={(e) => setSelectedSubcategoryId(e.target.value)}
              className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
            >
              <option value="">None</option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>{s.emoji} {s.name}</option>
              ))}
            </select>
          </label>
        )}

        {/* Options */}
        <div className="border border-[#e6e1d6] rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="block text-xs font-semibold text-dark">Pricing &amp; stock</span>
              <span className="block text-[11px] text-ink-muted mt-0.5">
                Each row is a pack option customers can choose. The first row is the default.
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

          {/* Pack option presets (saved to the category) */}
          <div className="border border-[#e6e1d6] rounded-xl p-4 space-y-3">
            <div>
              <span className="block text-xs font-semibold text-dark">Pack option presets</span>
              <span className="block text-[11px] text-ink-muted mt-0.5">
                Quick-fill pack labels for this category. Saved to the category and reused for all its products.
              </span>
            </div>
            {presetUnits.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {presetUnits.map((u) => (
                  <span key={u} className="inline-flex items-center gap-1 h-6 pl-2.5 pr-1 rounded-full bg-[#f4f1ea] text-[11px] text-dark">
                    <button type="button" onClick={() => quickFill(u)} title={`Fill option with ${u}`} className="font-medium hover:text-brand">
                      {u}
                    </button>
                    <button type="button" onClick={() => setPresetUnits(presetUnits.filter((x) => x !== u))} title="Remove preset" className="w-4 h-4 rounded-full flex items-center justify-center text-ink-muted hover:text-red">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-ink-muted">No presets yet. Add common pack options below.</p>
            )}
            <div className="flex gap-2">
              <input
                value={newPreset}
                onChange={(e) => setNewPreset(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPreset(); } }}
                placeholder="e.g. Half bag, 5 kg, Paint"
                className="flex-1 h-9 px-3 border border-[#e6e1d6] rounded-xl text-xs text-dark bg-white focus:outline-none focus:border-dark"
              />
              <button
                type="button"
                onClick={addPreset}
                className="h-9 px-3 rounded-full border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-[#f4f1ea] transition-colors shrink-0"
              >
                Add
              </button>
            </div>
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
                    <span className="block text-xs font-medium text-ink-soft mb-1.5">Pack option</span>
                    <input
                      type="text"
                      value={row.weight}
                      onChange={(e) => updateRow(i, "weight", e.target.value)}
                      placeholder="e.g. 1 Piece, Half Dozen"
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
          <Field label="Low-stock alert at" name="low_stock_threshold" type="number" defaultValue={product ? String(product.low_stock_threshold ?? 5) : "5"} />
        </div>
        <label className="block max-w-sm">
          <span className="block text-xs font-medium text-ink-soft mb-1.5">Stock status label</span>
          <select
            value={stockLabelVisibility}
            onChange={(e) => setStockLabelVisibility(e.target.value)}
            className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
          >
            <option value="category">Use category default</option>
            <option value="show">Always show</option>
            <option value="hide">Always hide</option>
          </select>
          <span className="block text-[11px] text-ink-muted mt-1.5">
            Controls the storefront label only. Stock and checkout behavior are unchanged.
          </span>
        </label>
        <p className="text-[11px] text-ink-muted -mt-2">
          You&apos;ll be alerted when stock drops to this number. Defaults to 5.
        </p>

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
