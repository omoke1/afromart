"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-12 lg:pt-20 pb-20">
        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Welcome back</p>
        <h1 className="text-3xl font-semibold text-dark tracking-tight">Sign in to AfroMart</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Track orders, save your delivery details and re-order favourites in one tap.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <Field label="Email address" name="email" type="email" value={email} onChange={setEmail} />
          <Field label="Password" name="password" type="password" value={password} onChange={setPassword} />

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

        <p className="mt-8 text-sm text-ink-soft text-center">
          New to AfroMart?{" "}
          <Link href={redirectTo !== "/account" ? `/signup?redirect=${redirectTo}` : "/signup"} className="text-dark font-semibold hover:text-brand">
            Create an account
          </Link>
        </p>
      </div>
      <Footer />
    </main>
  );
}

function Field({ label, name, type = "text", value, onChange }: { label: string; name: string; type?: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark transition-colors"
        required
      />
    </label>
  );
}
