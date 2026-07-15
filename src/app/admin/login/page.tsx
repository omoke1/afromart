"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Verify this account is actually an admin before entering the dashboard —
    // otherwise the layout would bounce them straight back out.
    const { data: role } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    if (!role) {
      await supabase.auth.signOut();
      setError("This account does not have admin access.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-dark flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7">
              <rect width="32" height="32" rx="7" fill="white" />
              <path d="M10 13 C10 9.5 13 7.5 16 7.5 C19 7.5 22 9.5 22 13" stroke="#FF4200" strokeWidth="2" strokeLinecap="round" fill="none" />
              <rect x="7" y="13" width="18" height="12" rx="2.5" fill="#FF4200" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-dark tracking-tight">Admin sign in</h1>
          <p className="text-sm text-ink-soft mt-2">AfroMart admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-xs font-medium text-ink-soft mb-1.5">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
              required
            />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-ink-soft mb-1.5">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-4 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
              required
            />
          </label>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
