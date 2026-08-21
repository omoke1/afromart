"use client";

import { useEffect, useState } from "react";
import { Eye, KeyRound } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [visibility, setVisibility] = useState({ show_catalog_nav: false, show_product_breadcrumbs: false, show_product_categories: false });
  const [visibilitySaving, setVisibilitySaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/site-settings").then((res) => res.json()).then((data) => {
      if (data.settings) setVisibility((current) => ({ ...current, ...data.settings }));
    });
  }, []);

  async function saveVisibility() {
    setVisibilitySaving(true);
    await fetch("/api/admin/site-settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(visibility) });
    setVisibilitySaving(false);
    toast("Visibility settings updated.");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (password.length < 8) {
      toast("Password must be at least 8 characters.", "error");
      return;
    }
    if (password !== confirm) {
      toast("Passwords don't match.", "error");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/auth/password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      toast(data.error ?? "Could not change password.", "error");
      return;
    }

    toast("Password updated. Other sessions were signed out.");
    setPassword("");
    setConfirm("");
  }

  const strength = password.length >= 12 ? "Strong" : password.length >= 8 ? "OK" : "Weak";

  return (
    <div className="max-w-md">
      <h2 className="text-lg font-semibold text-dark mb-6">Settings</h2>

      <div className="bg-white border border-[#e6e1d6] rounded-xl p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-ink-muted" />
          <h3 className="text-sm font-semibold text-dark">Storefront visibility</h3>
        </div>
        <div className="space-y-3">
          {([
            ["show_catalog_nav", "Categories and Products navigation"],
            ["show_product_breadcrumbs", "Product breadcrumbs"],
            ["show_product_categories", "Product category labels"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 text-sm text-dark">
              <input type="checkbox" checked={visibility[key]} onChange={(e) => setVisibility((current) => ({ ...current, [key]: e.target.checked }))} className="accent-brand" />
              {label}
            </label>
          ))}
        </div>
        <button onClick={saveVisibility} disabled={visibilitySaving} className="mt-5 h-9 px-5 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand disabled:opacity-50">
          {visibilitySaving ? "Saving…" : "Save visibility"}
        </button>
      </div>

      <div className="bg-white border border-[#e6e1d6] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-4 h-4 text-ink-muted" />
          <h3 className="text-sm font-semibold text-dark">Change password</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-xs text-ink-soft mb-1.5">New password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
              className="w-full h-9 px-3 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white focus:outline-none focus:border-dark"
            />
            {password && (
              <span
                className={`text-xs mt-1 block ${
                  password.length >= 8 ? "text-green" : "text-ink-muted"
                }`}
              >
                Strength: {strength}
              </span>
            )}
          </label>

          <label className="block">
            <span className="block text-xs text-ink-soft mb-1.5">Confirm password</span>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              placeholder="Repeat the password"
              className="w-full h-9 px-3 border border-[#e6e1d6] rounded-lg text-sm text-dark bg-white focus:outline-none focus:border-dark"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="h-9 px-5 rounded-full bg-dark text-white text-xs font-semibold hover:bg-brand transition-colors disabled:opacity-50"
          >
            {saving ? "Saving…" : "Update password"}
          </button>
        </form>

        <p className="text-xs text-ink-muted mt-4">
          Changing your password signs out all other devices.
        </p>
      </div>
    </div>
  );
}
