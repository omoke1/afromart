"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"details" | "code">("details");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
        return;
      }
      setStep("code");
    } finally {
      setLoading(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "That code didn't work. Try again.");
        return;
      }

      const name = [firstName, lastName].filter(Boolean).join(" ").trim();
      if (name) {
        await fetch("/api/auth/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
      }

      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
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

        {step === "details" ? (
          <form onSubmit={requestCode} className="mt-8 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label="First name" name="first" value={firstName} onChange={setFirstName} />
              <Field label="Last name" name="last" value={lastName} onChange={setLastName} />
            </div>
            <Field label="Email" name="email" type="email" value={email} onChange={setEmail} autoFocus />
            <p className="text-xs text-ink-muted">
              We&apos;ll email you a 6-digit code to verify your account.
            </p>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors disabled:opacity-50"
            >
              {loading ? "Sending code..." : "Email me a code"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="mt-8 space-y-4">
            <p className="text-sm text-ink-soft">
              We sent a 6-digit code to <span className="font-semibold text-dark">{email.trim().toLowerCase()}</span>.
            </p>
            <Field
              label="6-digit code"
              name="code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={setCode}
              placeholder="000000"
              maxLength={6}
              autoFocus
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            <button
              type="button"
              onClick={() => setStep("details")}
              className="text-sm text-ink-soft hover:text-dark transition-colors"
            >
              ← Change email
            </button>
          </form>
        )}

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

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  autoFocus,
  placeholder,
  maxLength,
  inputMode,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  autoFocus?: boolean;
  placeholder?: string;
  maxLength?: number;
  inputMode?: "text" | "numeric" | "email" | "tel";
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoFocus={autoFocus}
        placeholder={placeholder}
        maxLength={maxLength}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="w-full h-11 px-4 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark transition-colors"
        required
      />
    </label>
  );
}
