"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

type Mode = "code" | "password";
type CodeStep = "email" | "code";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/account";

  const [mode, setMode] = useState<Mode>("code");
  const [codeStep, setCodeStep] = useState<CodeStep>("email");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");

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
      setSentTo(email.trim().toLowerCase());
      setCodeStep("code");
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
      router.push(redirectTo);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function passwordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Incorrect email or password.");
        return;
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
        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Welcome back</p>
        <h1 className="text-3xl font-semibold text-dark tracking-tight">Sign in to AfroMart</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Track orders, save your delivery details and re-order favourites in one tap.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-1 p-1 bg-surface rounded-xl">
          {(["code", "password"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => {
                setMode(m);
                setError("");
                setCodeStep("email");
                setCode("");
              }}
              className={`h-10 rounded-lg text-sm font-medium transition-colors ${
                mode === m ? "bg-white text-dark shadow-sm" : "text-ink-soft hover:text-dark"
              }`}
            >
              {m === "code" ? "Email a code" : "Password"}
            </button>
          ))}
        </div>

        {mode === "code" && codeStep === "email" && (
          <form onSubmit={requestCode} className="mt-6 space-y-4">
            <Field label="Email address" name="email" type="email" value={email} onChange={setEmail} autoFocus />
            <p className="text-xs text-ink-muted">
              We&apos;ll email you a 6-digit code to sign in. No password needed.
            </p>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors disabled:opacity-50"
            >
              {loading ? "Sending code..." : "Email me a login code"}
            </button>
          </form>
        )}

        {mode === "code" && codeStep === "code" && (
          <form onSubmit={verifyCode} className="mt-6 space-y-4">
            <p className="text-sm text-ink-soft">
              We sent a 6-digit code to <span className="font-semibold text-dark">{sentTo}</span>.
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
              {loading ? "Signing in..." : "Sign in"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setCodeStep("email")}
                className="text-ink-soft hover:text-dark transition-colors"
              >
                ← Change email
              </button>
              <button
                type="button"
                onClick={async () => {
                  setError("");
                  setLoading(true);
                  try {
                    await fetch("/api/auth/request-code", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ email }),
                    });
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="font-medium text-dark hover:text-brand transition-colors disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {mode === "password" && (
          <form onSubmit={passwordSubmit} className="mt-6 space-y-4">
            <Field label="Email address" name="email" type="email" value={email} onChange={setEmail} autoFocus />
            <Field label="Password" name="password" type="password" value={password} onChange={setPassword} />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        )}

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
