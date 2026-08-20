"use client";

import { Fragment, useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronRight, Upload, Clipboard, ImageUp } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  bg_color: string;
  description: string;
  weight_units: string[];
};

type Subcategory = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  emoji: string;
  position: number;
};

function CategoryAvatar({ name, imageUrl, bgColor }: { name: string; imageUrl?: string | null; bgColor?: string }) {
  if (imageUrl) {
    return (
      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-[#e6e1d6]">
        <Image src={imageUrl} alt={name} width={32} height={32} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div
      className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center text-sm font-semibold text-dark border border-[#e6e1d6]"
      style={{ background: bgColor || "#f4f1ea" }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [weightUnits, setWeightUnits] = useState<string[]>([]);
  const [newUnit, setNewUnit] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [subcats, setSubcats] = useState<Record<string, Subcategory[]>>({});
  const [subcatModal, setSubcatModal] = useState<"create" | "edit" | null>(null);
  const [subcatEdit, setSubcatEdit] = useState<Subcategory | null>(null);
  const [subcatCategoryId, setSubcatCategoryId] = useState<string>("");
  const [deleteSubcatId, setDeleteSubcatId] = useState<string | null>(null);

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories((data.categories ?? []) as Category[]);
    setLoading(false);
  }

  async function loadSubcats(categoryId: string) {
    const res = await fetch(`/api/admin/subcategories?category_id=${categoryId}`);
    const data = await res.json();
    setSubcats((prev) => ({ ...prev, [categoryId]: data.subcategories ?? [] }));
  }

  function toggleExpand(catId: string) {
    if (expandedCat === catId) { setExpandedCat(null); }
    else { setExpandedCat(catId); if (!subcats[catId]) loadSubcats(catId); }
  }

  function openCreate() { setEditItem(null); setWeightUnits([]); setNewUnit(""); setImageUrl(""); setModal("create"); }
  function openEdit(cat: Category) { setEditItem(cat); setWeightUnits(cat.weight_units ?? []); setNewUnit(""); setImageUrl(cat.image_url ?? ""); setModal("edit"); }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name") as string,
      slug: form.get("slug") as string,
      image_url: imageUrl || null,
      bg_color: (form.get("bg_color") as string) || "#f4f1ea",
      description: (form.get("description") as string) || "",
      weight_units: weightUnits,
    };
    const url = modal === "edit" && editItem ? `/api/admin/categories/${editItem.id}` : "/api/admin/categories";
    const method = modal === "edit" ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setModal(null); setEditItem(null); setSaving(false); loadCategories();
  }

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) { alert("Please upload an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image must be under 5 MB."); return; }
    setUploading(true);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body });
    const data = await res.json();
    if (!res.ok || !data.url) {
      alert(data.error ?? "Upload failed.");
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
    if (file) { uploadFile(file); return; }
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const blob = items[i].getAsFile();
        if (blob) { uploadFile(blob); return; }
      }
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }

  async function handleDelete() {
    if (!deleteId) return;
    await fetch(`/api/admin/categories/${deleteId}`, { method: "DELETE" });
    setDeleteId(null); loadCategories();
  }

  function openSubcatCreate(categoryId: string) { setSubcatEdit(null); setSubcatCategoryId(categoryId); setSubcatModal("create"); }
  function openSubcatEdit(sub: Subcategory) { setSubcatEdit(sub); setSubcatCategoryId(sub.category_id); setSubcatModal("edit"); }

  async function handleSubcatSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      category_id: subcatCategoryId,
      name: form.get("name") as string,
      slug: form.get("slug") as string,
      emoji: (form.get("emoji") as string) || "📦",
      position: parseInt(form.get("position") as string) || 0,
    };
    const url = subcatModal === "edit" && subcatEdit ? `/api/admin/subcategories/${subcatEdit.id}` : "/api/admin/subcategories";
    const method = subcatModal === "edit" ? "PATCH" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setSubcatModal(null); setSubcatEdit(null); setSaving(false); loadSubcats(subcatCategoryId);
  }

  async function handleSubcatDelete() {
    if (!deleteSubcatId) return;
    const sub = Object.values(subcats).flat().find((s) => s.id === deleteSubcatId);
    await fetch(`/api/admin/subcategories/${deleteSubcatId}`, { method: "DELETE" });
    setDeleteSubcatId(null);
    if (sub) loadSubcats(sub.category_id);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark">Categories</h2>
        <button onClick={openCreate} className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors">
          <Plus className="w-3.5 h-3.5" /> Add category
        </button>
      </div>

      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted text-xs border-b border-[#e6e1d6]">
              <th className="py-3 px-4 font-medium w-8"></th>
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium">Slug</th>
              <th className="py-3 px-4 font-medium">Subcategories</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e1d6]/50">
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-sm text-ink-muted">Loading…</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-sm text-ink-muted">No categories yet.</td></tr>
            ) : (
              categories.map((c) => (
                <Fragment key={c.id}>
                  <tr className="hover:bg-[#fafaf7]">
                    <td className="py-3 px-2">
                      <button onClick={() => toggleExpand(c.id)} className="text-ink-muted hover:text-dark p-1">
                        {expandedCat === c.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <CategoryAvatar name={c.name} imageUrl={c.image_url} bgColor={c.bg_color} />
                        <span className="text-dark font-medium">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-ink-soft font-mono text-xs">{c.slug}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {(subcats[c.id] ?? []).length === 0 ? (
                          <span className="text-ink-muted text-xs">—</span>
                        ) : (
                          (subcats[c.id] ?? []).map((s) => (
                            <span key={s.id} className="inline-block px-2 py-0.5 rounded-full bg-[#f4f1ea] text-[11px] text-ink-soft">{s.emoji} {s.name}</span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(c)} className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-dark">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button onClick={() => setDeleteId(c.id)} className="inline-flex items-center gap-1 text-xs text-red/70 hover:text-red">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedCat === c.id && (
                    <tr>
                      <td colSpan={5} className="px-6 py-3 bg-[#fafaf7]">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-dark">Subcategories</span>
                          <button onClick={() => openSubcatCreate(c.id)} className="flex items-center gap-1 h-7 px-2.5 rounded-full border border-[#e6e1d6] text-[11px] font-semibold text-dark hover:bg-[#f4f1ea] transition-colors">
                            <Plus className="w-3 h-3" /> Add
                          </button>
                        </div>
                        {(subcats[c.id] ?? []).length === 0 ? (
                          <p className="text-xs text-ink-muted py-1">No subcategories yet.</p>
                        ) : (
                          <div className="space-y-1">
                            {(subcats[c.id] ?? []).map((s) => (
                              <div key={s.id} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white border border-[#e6e1d6]/50">
                                <span className="text-xs text-dark">{s.emoji} {s.name} <span className="text-ink-muted font-mono">({s.slug})</span></span>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => openSubcatEdit(s)} className="text-ink-soft hover:text-dark"><Pencil className="w-3 h-3" /></button>
                                  <button onClick={() => setDeleteSubcatId(s.id)} className="text-red/50 hover:text-red"><Trash2 className="w-3 h-3" /></button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark">{modal === "create" ? "New category" : "Edit category"}</h3>
              <button onClick={() => setModal(null)} className="text-ink-muted hover:text-dark"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <Field label="Name" name="name" defaultValue={editItem?.name} required />
              <Field label="Slug" name="slug" defaultValue={editItem?.slug} required placeholder="e.g. grains" />
              <label className="block">
                <span className="block text-xs font-medium text-ink-soft mb-1.5">Image</span>
                <div
                  onPaste={handlePaste}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="relative w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden bg-white border-[#e6e1d6] hover:border-dark"
                >
                  {imageUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Category" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setImageUrl(""); if (fileRef.current) fileRef.current.value = ""; }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-dark/70 text-white flex items-center justify-center hover:bg-dark transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-7 h-7 text-ink-muted mb-2" />
                      <span className="text-sm text-ink-muted">
                        {uploading ? "Uploading…" : "Click, paste, or drag an image"}
                      </span>
                      <span className="flex items-center gap-3 mt-2 text-[11px] text-ink-muted">
                        <span className="flex items-center gap-1"><Clipboard className="w-3 h-3" /> Ctrl+V</span>
                        <span className="flex items-center gap-1"><ImageUp className="w-3 h-3" /> Drag &amp; drop</span>
                      </span>
                      <span className="text-xs text-ink-muted mt-1">PNG, JPG, WebP up to 5 MB · leave blank for text fallback</span>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={handleImage} className="hidden" />
              </label>
              <Field label="Background color" name="bg_color" defaultValue={editItem?.bg_color ?? "#f4f1ea"} />
              <label className="block">
                <span className="block text-xs font-medium text-ink-soft mb-1.5">Description</span>
                <textarea name="description" rows={2} defaultValue={editItem?.description ?? ""}
                  className="w-full px-4 py-2.5 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark resize-none" />
              </label>
              <div className="block">
                <span className="block text-xs font-medium text-ink-soft mb-1.5">Weight / Size presets</span>
                <span className="block text-[11px] text-ink-muted mb-2">These show as quick-select options when adding products in this category.</span>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {weightUnits.map((u) => (
                    <span key={u} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f4f1ea] text-xs text-dark">
                      {u}
                      <button type="button" onClick={() => setWeightUnits(weightUnits.filter((x) => x !== u))} className="text-ink-muted hover:text-red">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {weightUnits.length === 0 && <span className="text-xs text-ink-muted">No presets yet.</span>}
                </div>
                <div className="flex gap-2">
                  <input value={newUnit} onChange={(e) => setNewUnit(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const val = newUnit.trim(); if (val && !weightUnits.includes(val)) { setWeightUnits([...weightUnits, val]); setNewUnit(""); } } }}
                    placeholder="e.g. Half bag, 5 kg, Paint"
                    className="flex-1 h-9 px-3 border border-[#e6e1d6] rounded-xl text-xs text-dark bg-white focus:outline-none focus:border-dark" />
                  <button type="button" onClick={() => { const val = newUnit.trim(); if (val && !weightUnits.includes(val)) { setWeightUnits([...weightUnits, val]); setNewUnit(""); } }}
                    className="h-9 px-3 rounded-full border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-[#f4f1ea] transition-colors shrink-0">Add</button>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setModal(null)} className="h-9 px-4 rounded-full border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-[#f4f1ea] transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="h-9 px-5 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors disabled:opacity-50">
                  {saving ? "Saving…" : modal === "create" ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-dark mb-2">Delete category?</h3>
            <p className="text-sm text-ink-soft mb-6">Products in this category will not be deleted, but their category reference may need updating.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteId(null)} className="h-9 px-4 rounded-full border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-[#f4f1ea] transition-colors">Cancel</button>
              <button onClick={handleDelete} className="h-9 px-4 rounded-full bg-red text-white text-xs font-semibold hover:bg-red/90 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {subcatModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSubcatModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark">{subcatModal === "create" ? "New subcategory" : "Edit subcategory"}</h3>
              <button onClick={() => setSubcatModal(null)} className="text-ink-muted hover:text-dark"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubcatSave} className="space-y-4">
              <Field label="Name" name="name" defaultValue={subcatEdit?.name} required placeholder="e.g. Fresh Fish" />
              <Field label="Slug" name="slug" defaultValue={subcatEdit?.slug} required placeholder="e.g. fresh-fish" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Emoji" name="emoji" defaultValue={subcatEdit?.emoji ?? "📦"} />
                <Field label="Position" name="position" type="number" defaultValue={String(subcatEdit?.position ?? 0)} />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setSubcatModal(null)} className="h-9 px-4 rounded-full border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-[#f4f1ea] transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="h-9 px-5 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors disabled:opacity-50">
                  {saving ? "Saving…" : subcatModal === "create" ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteSubcatId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteSubcatId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-dark mb-2">Delete subcategory?</h3>
            <p className="text-sm text-ink-soft mb-6">Products assigned to this subcategory will become unassigned.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteSubcatId(null)} className="h-9 px-4 rounded-full border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-[#f4f1ea] transition-colors">Cancel</button>
              <button onClick={handleSubcatDelete} className="h-9 px-4 rounded-full bg-red text-white text-xs font-semibold hover:bg-red/90 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, name, type = "text", required, defaultValue, placeholder }: {
  label: string; name: string; type?: string; required?: boolean; defaultValue?: string; placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <input name={name} type={type} required={required} defaultValue={defaultValue} placeholder={placeholder}
        className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark" />
    </label>
  );
}
