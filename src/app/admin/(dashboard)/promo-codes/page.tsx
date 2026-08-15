"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

type PromoCode = {
  id: string;
  code: string;
  description: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  min_subtotal: number;
  max_discount: number | null;
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  created_at: string;
};

type PromoForm = {
  code: string;
  description: string;
  discount_type: "percent" | "fixed";
  discount_value: string;
  min_subtotal: string;
  max_discount: string;
  usage_limit: string;
  starts_at: string;
  expires_at: string;
};

const emptyForm: PromoForm = {
  code: "",
  description: "",
  discount_type: "percent",
  discount_value: "",
  min_subtotal: "",
  max_discount: "",
  usage_limit: "",
  starts_at: "",
  expires_at: "",
};

export default function PromoCodesAdmin() {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState("");

  function load() {
    return fetch("/api/admin/promo-codes")
      .then((r) => r.json())
      .then((json) => {
        setCodes((json.codes ?? []) as PromoCode[]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/promo-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "Could not create the code.");
      return;
    }
    setForm({ ...emptyForm });
    setShowForm(false);
    await load();
  }

  async function toggle(code: PromoCode) {
    await fetch(`/api/admin/promo-codes/${code.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !code.is_active }),
    });
    await load();
  }

  async function remove(code: PromoCode) {
    if (!confirm(`Delete promo code ${code.code}?`)) return;
    await fetch(`/api/admin/promo-codes/${code.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-dark">Promo codes</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-dark text-white text-sm font-medium hover:bg-brand transition-colors"
        >
          <Plus className="w-4 h-4" /> New code
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white border border-[#e6e1d6] rounded-xl p-5 mb-6 grid md:grid-cols-3 gap-4">
          <Input label="Code" value={form.code} onChange={(v) => setForm({ ...form, code: v })} placeholder="e.g. JOLLOF10" />
          <Input label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} placeholder="10% off everything" />
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1.5">Discount type</label>
            <select
              value={form.discount_type}
              onChange={(e) => setForm({ ...form, discount_type: e.target.value as "percent" | "fixed" })}
              className="w-full h-9 px-3 border border-[#e6e1d6] rounded-lg text-sm bg-white focus:outline-none focus:border-dark"
            >
              <option value="percent">% off</option>
              <option value="fixed">£ off</option>
            </select>
          </div>
          <Input label={form.discount_type === "percent" ? "Value (%)" : "Value (£)"} type="number" value={form.discount_value} onChange={(v) => setForm({ ...form, discount_value: v })} placeholder={form.discount_type === "percent" ? "10" : "5"} />
          <Input label="Min order subtotal (£)" type="number" value={form.min_subtotal} onChange={(v) => setForm({ ...form, min_subtotal: v })} placeholder="0" />
          <Input label="Max discount (£, optional)" type="number" value={form.max_discount} onChange={(v) => setForm({ ...form, max_discount: v })} placeholder="e.g. 10" />
          <Input label="Usage limit (optional)" type="number" value={form.usage_limit} onChange={(v) => setForm({ ...form, usage_limit: v })} placeholder="Unlimited" />
          <Input label="Starts (optional)" type="date" value={form.starts_at} onChange={(v) => setForm({ ...form, starts_at: v })} />
          <Input label="Expires (optional)" type="date" value={form.expires_at} onChange={(v) => setForm({ ...form, expires_at: v })} />
          <div className="flex items-end">
            <button className="h-9 px-4 rounded-full bg-dark text-white text-sm font-medium hover:bg-brand transition-colors">
              Create code
            </button>
          </div>
          {error && <p className="text-sm text-red-600 md:col-span-3">{error}</p>}
        </form>
      )}

      <div className="bg-white border border-[#e6e1d6] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-ink-muted text-xs border-b border-[#e6e1d6]">
              <th className="py-3 px-4 font-medium">Code</th>
              <th className="py-3 px-4 font-medium">Discount</th>
              <th className="py-3 px-4 font-medium">Min spend</th>
              <th className="py-3 px-4 font-medium">Expires</th>
              <th className="py-3 px-4 font-medium text-center">Usage</th>
              <th className="py-3 px-4 font-medium">Status</th>
              <th className="py-3 px-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6e1d6]/50">
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-ink-muted">Loading…</td></tr>
            ) : codes.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-sm text-ink-muted">No promo codes yet. Create your first one above.</td></tr>
            ) : (
              codes.map((c) => (
                <tr key={c.id} className="hover:bg-[#fafaf7]">
                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold text-dark">{c.code}</span>
                    {c.description && <span className="block text-xs text-ink-muted">{c.description}</span>}
                  </td>
                  <td className="py-3 px-4 text-ink-soft">
                    {c.discount_type === "percent" ? `${Number(c.discount_value)}% off` : `£${Number(c.discount_value).toFixed(2)} off`}
                    {c.max_discount != null && c.discount_type === "percent" && (
                      <span className="block text-xs text-ink-muted">max £{Number(c.max_discount).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-ink-soft">£{Number(c.min_subtotal).toFixed(2)}</td>
                  <td className="py-3 px-4 text-ink-soft">
                    {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="py-3 px-4 text-center text-ink-soft">
                    {c.used_count}{c.usage_limit != null ? ` / ${c.usage_limit}` : ""}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => toggle(c)}
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                        c.is_active
                          ? "text-green border-green/30 bg-green/10"
                          : "text-ink-muted border-[#e6e1d6] bg-[#f4f1ea]"
                      }`}
                    >
                      {c.is_active ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => remove(c)} className="text-xs text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-3 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white focus:outline-none focus:border-dark"
      />
    </label>
  );
}
