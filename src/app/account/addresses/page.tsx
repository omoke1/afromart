"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, ChevronRight, X, Loader2 } from "lucide-react";
import AccountSidebar from "@/components/layout/AccountSidebar";
import { createClient } from "@/lib/supabase/client";

type Address = {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2: string | null;
  city: string;
  postcode: string;
  country: string;
  is_default: boolean;
};

const emptyForm = {
  label: "",
  name: "",
  line1: "",
  line2: "",
  city: "",
  postcode: "",
  country: "United Kingdom",
};

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadAddresses() {
    const supabase = createClient();
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: true });
    setAddresses(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("addresses")
        .select("*")
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: true });
      if (cancelled) return;
      setAddresses(data ?? []);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(a: Address) {
    setEditing(a);
    setForm({
      label: a.label,
      name: a.name,
      line1: a.line1,
      line2: a.line2 ?? "",
      city: a.city,
      postcode: a.postcode,
      country: a.country,
    });
    setFormOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();

    const payload = {
      ...form,
      line2: form.line2 || null,
    };

    if (editing) {
      await supabase.from("addresses").update(payload).eq("id", editing.id);
    } else {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from("addresses").insert({ ...payload, user_id: user!.id });
    }

    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
    await loadAddresses();
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const supabase = createClient();
    await supabase.from("addresses").delete().eq("id", id);
    await loadAddresses();
  }

  async function handleMakeDefault(id: string) {
    const supabase = createClient();
    await supabase.from("addresses").update({ is_default: false }).neq("id", id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    await loadAddresses();
  }

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
      <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8 flex-wrap">
        <Link href="/" className="hover:text-dark">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/account" className="hover:text-dark">Account</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-dark">Addresses</span>
      </nav>

      <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Account</p>
      <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">Saved addresses</h1>

      <div className="mt-10 grid lg:grid-cols-[240px_1fr] gap-10">
        <AccountSidebar />

        <section>
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-5">
              {addresses.map((a) => (
                <div key={a.id} className="border border-line rounded-2xl p-5 relative">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted">{a.label || "Address"}</p>
                    {a.is_default && (
                      <span className="text-[10px] font-semibold text-dark bg-gold px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-dark">{a.name}</p>
                  <p className="text-sm text-ink-soft mt-1">{a.line1}</p>
                  {a.line2 && <p className="text-sm text-ink-soft">{a.line2}</p>}
                  <p className="text-sm text-ink-soft">{a.city}, {a.postcode}</p>
                  <p className="text-sm text-ink-soft">{a.country}</p>

                  <div className="mt-5 flex items-center gap-3 text-sm">
                    <button
                      onClick={() => openEdit(a)}
                      className="font-medium text-dark hover:text-brand flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    {!a.is_default && (
                      <button
                        onClick={() => handleMakeDefault(a.id)}
                        className="text-ink-soft hover:text-dark"
                      >
                        Make default
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="ml-auto text-ink-muted hover:text-brand flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={openAdd}
                className="border border-dashed border-line rounded-2xl p-5 flex flex-col items-center justify-center text-ink-soft hover:border-dark hover:text-dark transition-colors min-h-[180px]"
              >
                <Plus className="w-6 h-6 mb-2" />
                <span className="font-medium">Add a new address</span>
              </button>
            </div>
          )}

          {formOpen && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-semibold text-dark">
                    {editing ? "Edit address" : "New address"}
                  </h2>
                  <button
                    type="button"
                    onClick={() => { setFormOpen(false); setEditing(null); }}
                    className="text-ink-muted hover:text-dark"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <input
                  placeholder="Label (e.g. Home, Work)"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-line text-sm focus:outline-none focus:border-dark"
                />
                <input
                  placeholder="Full name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-line text-sm focus:outline-none focus:border-dark"
                />
                <input
                  placeholder="Address line 1"
                  required
                  value={form.line1}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-line text-sm focus:outline-none focus:border-dark"
                />
                <input
                  placeholder="Address line 2 (optional)"
                  value={form.line2}
                  onChange={(e) => setForm({ ...form, line2: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-line text-sm focus:outline-none focus:border-dark"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="City"
                    required
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="h-11 px-4 rounded-xl border border-line text-sm focus:outline-none focus:border-dark"
                  />
                  <input
                    placeholder="Postcode"
                    required
                    value={form.postcode}
                    onChange={(e) => setForm({ ...form, postcode: e.target.value })}
                    className="h-11 px-4 rounded-xl border border-line text-sm focus:outline-none focus:border-dark"
                  />
                </div>
                <input
                  placeholder="Country"
                  required
                  value={form.country}
                  onChange={(e) => setForm({ ...form, country: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl border border-line text-sm focus:outline-none focus:border-dark"
                />
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setFormOpen(false); setEditing(null); }}
                    className="flex-1 h-11 rounded-full border border-line text-dark text-sm font-semibold hover:bg-surface transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 h-11 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : editing ? "Save changes" : "Add address"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
