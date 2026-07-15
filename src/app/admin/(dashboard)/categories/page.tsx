"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Category = {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  bg_color: string;
  description: string;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editItem, setEditItem] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const supabase = createClient();
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories((data ?? []) as Category[]);
    setLoading(false);
  }

  function openCreate() {
    setEditItem(null);
    setModal("create");
  }

  function openEdit(cat: Category) {
    setEditItem(cat);
    setModal("edit");
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const payload = {
      name: form.get("name") as string,
      slug: form.get("slug") as string,
      emoji: (form.get("emoji") as string) || "📦",
      bg_color: (form.get("bg_color") as string) || "#f4f1ea",
      description: (form.get("description") as string) || "",
    };

    if (modal === "edit" && editItem) {
      await supabase.from("categories").update(payload).eq("id", editItem.id);
    } else {
      await supabase.from("categories").insert(payload);
    }

    setModal(null);
    setEditItem(null);
    setSaving(false);
    loadCategories();
  }

  async function handleDelete() {
    if (!deleteId) return;
    const supabase = createClient();
    await supabase.from("categories").delete().eq("id", deleteId);
    setDeleteId(null);
    loadCategories();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark">Categories</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Add category
        </button>
      </div>

      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted text-xs border-b border-[#e6e1d6]">
              <th className="py-3 px-4 font-medium">Category</th>
              <th className="py-3 px-4 font-medium">Slug</th>
              <th className="py-3 px-4 font-medium">Description</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e1d6]/50">
            {loading ? (
              <tr><td colSpan={4} className="py-12 text-center text-sm text-ink-muted">Loading…</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="py-12 text-center text-sm text-ink-muted">No categories yet.</td></tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="hover:bg-[#fafaf7]">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{c.emoji}</span>
                      <span className="text-dark font-medium">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-ink-soft font-mono text-xs">{c.slug}</td>
                  <td className="py-3 px-4 text-ink-soft truncate max-w-xs">{c.description || "—"}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-dark"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="inline-flex items-center gap-1 text-xs text-red/70 hover:text-red"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit modal */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-dark">
                {modal === "create" ? "New category" : "Edit category"}
              </h3>
              <button onClick={() => setModal(null)} className="text-ink-muted hover:text-dark">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <Field label="Name" name="name" defaultValue={editItem?.name} required />
              <Field label="Slug" name="slug" defaultValue={editItem?.slug} required placeholder="e.g. grains" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="Emoji" name="emoji" defaultValue={editItem?.emoji ?? "📦"} />
                <Field label="Background color" name="bg_color" defaultValue={editItem?.bg_color ?? "#f4f1ea"} />
              </div>
              <label className="block">
                <span className="block text-xs font-medium text-ink-soft mb-1.5">Description</span>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={editItem?.description ?? ""}
                  className="w-full px-4 py-2.5 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark resize-none"
                />
              </label>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="h-9 px-4 rounded-full border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-[#f4f1ea] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-9 px-5 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving…" : modal === "create" ? "Create" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-dark mb-2">Delete category?</h3>
            <p className="text-sm text-ink-soft mb-6">
              Products in this category will not be deleted, but their category reference may need updating.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="h-9 px-4 rounded-full border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-[#f4f1ea] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="h-9 px-4 rounded-full bg-red text-white text-xs font-semibold hover:bg-red/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
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
        placeholder={placeholder}
        className="w-full h-10 px-4 border border-[#e6e1d6] rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
      />
    </label>
  );
}
