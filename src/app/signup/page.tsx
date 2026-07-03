"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const createdUser = data.user;
    if (createdUser) {
      const name = [firstName, lastName].filter(Boolean).join(" ").trim() || null;
      await supabase.from("profiles").insert({
        id: createdUser.id,
        name: name ?? undefined,
        email: createdUser.email ?? undefined,
      });
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-12 lg:pt-20 pb-20">
        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Join AfroMart</p>
        <h1 className="text-3xl font-semibold text-dark tracking-tight">Create your account</h1>
        <p className="mt-3 text-sm text-ink-soft">
          A taste of home, delivered. Sign up to save addresses, reorder fast and get member-only deals.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name" name="first" value={firstName} onChange={setFirstName} />
            <Field label="Last name" name="last" value={lastName} onChange={setLastName} />
          </div>
          <Field label="Email" name="email" type="email" value={email} onChange={setEmail} />
          <Field label="Password" name="password" type="password" value={password} onChange={setPassword} />

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-8 text-sm text-ink-soft text-center">
          Already have an account?{" "}
          <Link href={redirectTo !== "/account" ? `/login?redirect=${redirectTo}` : "/login"} className="text-dark font-semibold hover:text-brand">
            Sign in
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
