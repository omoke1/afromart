"use client";

import React, { useEffect, useState } from "react";
import formatCurrency, { SYMBOLS } from "@/lib/currency";

type Currency = {
  code: string;
  name: string;
  symbol: string;
  rate_to_base: number;
  auto_update?: boolean;
};

export default function CurrenciesAdmin() {
  const [items, setItems] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Currency>({ code: "", name: "", symbol: "", rate_to_base: 1 });

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/currencies");
    const json = await res.json();
    setItems(json.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createOrUpdate(e?: React.FormEvent) {
    e?.preventDefault();
    const method = items.some(i => i.code === form.code) ? "PUT" : "POST";
    await fetch("/api/admin/currencies", { method, body: JSON.stringify(form) });
    setForm({ code: "", name: "", symbol: "", rate_to_base: 1 });
    await load();
  }

  async function remove(code: string) {
    if (!confirm(`Delete ${code}?`)) return;
    await fetch("/api/admin/currencies", { method: "DELETE", body: JSON.stringify({ code }) });
    await load();
  }

  function edit(item: Currency) {
    setForm(item);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Currencies</h1>
      <p className="mb-4">Manage currencies and exchange rates. GBP is the base/store currency.</p>

      <form onSubmit={createOrUpdate} className="mb-6 grid grid-cols-4 gap-2">
        <input placeholder="Code (e.g. USD)" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="border p-2" />
        <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-2" />
        <input placeholder="Symbol" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} className="border p-2" />
        <div className="flex gap-2">
          <input type="number" step="0.0001" placeholder="Rate to GBP" value={String(form.rate_to_base)} onChange={e => setForm({ ...form, rate_to_base: Number(e.target.value) })} className="border p-2 flex-1" />
          <button className="bg-sky-600 text-white px-4" type="submit">Save</button>
        </div>
      </form>

      {loading ? <div>Loading…</div> : (
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="text-left">
              <th className="p-2">Code</th>
              <th className="p-2">Name</th>
              <th className="p-2">Symbol</th>
              <th className="p-2">Rate (to GBP)</th>
              <th className="p-2">Example</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it => (
              <tr key={it.code} className="border-t">
                <td className="p-2">{it.code}</td>
                <td className="p-2">{it.name}</td>
                <td className="p-2">{it.symbol}</td>
                <td className="p-2">{Number(it.rate_to_base).toFixed(4)}</td>
                <td className="p-2">{it.symbol}{(1 * (it.rate_to_base)).toFixed(2)}</td>
                <td className="p-2">
                  <button className="mr-2 text-sky-600" onClick={() => edit(it)}>Edit</button>
                  <button className="text-red-600" onClick={() => remove(it.code)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
