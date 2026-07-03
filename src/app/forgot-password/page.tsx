"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-md mx-auto w-full px-4 pt-12 lg:pt-20 pb-20">
        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Account recovery</p>
        <h1 className="text-3xl font-semibold text-dark tracking-tight">Reset your password</h1>

        {sent ? (
          <div className="mt-8 border border-line rounded-2xl p-6 bg-surface">
            <div className="w-10 h-10 rounded-full bg-green/15 flex items-center justify-center mb-4">
              <Mail className="w-5 h-5 text-green" />
            </div>
            <h2 className="text-lg font-semibold text-dark">Check your inbox</h2>
            <p className="mt-2 text-sm text-ink-soft">
              We&apos;ve sent a password reset link to <strong className="text-dark">{email || "your email"}</strong>. The link expires in 30 minutes.
            </p>
            <p className="mt-4 text-xs text-ink-muted">
              Didn&apos;t get it? Check your spam folder, or{" "}
              <button onClick={() => setSent(false)} className="text-dark font-semibold hover:text-brand underline">
                try again
              </button>
              .
            </p>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm text-ink-soft">
              Enter the email you signed up with and we&apos;ll send a link to set a new password.
            </p>

            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <label className="block">
                <span className="block text-xs font-medium text-ink-soft mb-1.5">Email address</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 px-4 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark transition-colors"
                />
              </label>

              <button
                type="submit"
                className="w-full h-12 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors"
              >
                Send reset link
              </button>
            </form>
          </>
        )}

        <p className="mt-8 text-sm text-ink-soft text-center">
          Remembered it?{" "}
          <Link href="/login" className="text-dark font-semibold hover:text-brand">
            Sign in
          </Link>
        </p>
      </div>
      <Footer />
    </main>
  );
}
