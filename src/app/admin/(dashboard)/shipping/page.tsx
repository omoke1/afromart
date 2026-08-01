"use client";

import { useEffect, useState } from "react";
import formatCurrency from "@/lib/currency";

type ShippingSettings = {
  base_fee: number;
  per_kg_fee: number;
  free_delivery_threshold: number;
  enabled: boolean;
};

export default function ShippingAdmin() {
  const [settings, setSettings] = useState<ShippingSettings>({
    base_fee: 4.99,
    per_kg_fee: 1.25,
    free_delivery_threshold: 40,
    enabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch("/api/admin/shipping-settings");
      const json = await res.json();
      if (json?.data) {
        setSettings(json.data);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    await fetch("/api/admin/shipping-settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    setSaving(false);
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Shipping settings</h1>
        <p className="text-sm text-ink-muted mt-1">
          Control the delivery fee, per-kilogram shipping rate, and free delivery threshold.
        </p>
      </div>

      {loading ? (
        <div>Loading settings…</div>
      ) : (
        <form onSubmit={saveSettings} className="grid gap-4 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs font-medium text-ink-soft">Base delivery fee</span>
              <input
                type="number"
                step="0.01"
                value={settings.base_fee}
                onChange={(e) => setSettings({ ...settings, base_fee: Number(e.target.value) })}
                className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm"
              />
            </label>

            <label className="block">
              <span className="text-xs font-medium text-ink-soft">Per kilogram fee</span>
              <input
                type="number"
                step="0.01"
                value={settings.per_kg_fee}
                onChange={(e) => setSettings({ ...settings, per_kg_fee: Number(e.target.value) })}
                className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm"
              />
            </label>
          </div>

          <label className="block">
            <span className="text-xs font-medium text-ink-soft">Free delivery threshold</span>
            <input
              type="number"
              step="0.01"
              value={settings.free_delivery_threshold}
              onChange={(e) => setSettings({ ...settings, free_delivery_threshold: Number(e.target.value) })}
              className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm"
            />
          </label>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
            />
            Enable shipping charges
          </label>

          <div className="rounded-2xl border border-line bg-surface p-4 text-sm">
            <p className="font-medium text-dark mb-2">Current charge preview</p>
            <p className="text-ink-soft mb-1">
              Base fee: {formatCurrency(settings.base_fee)}
            </p>
            <p className="text-ink-soft mb-1">
              Per kg fee: {formatCurrency(settings.per_kg_fee)} per kg
            </p>
            <p className="text-ink-soft">
              Free delivery over {formatCurrency(settings.free_delivery_threshold)}
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-fit rounded-full bg-dark px-6 py-3 text-sm font-semibold text-white hover:bg-brand transition-colors"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </form>
      )}
    </div>
  );
}
