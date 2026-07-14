"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Loader2, Check, User, Lock, ShieldCheck } from "lucide-react";
import AccountSidebar from "@/components/layout/AccountSidebar";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;
      setEmail(user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, phone")
        .eq("id", user.id)
        .single();
      if (cancelled) return;
      setName(profile?.name ?? "");
      setPhone(profile?.phone ?? "");
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSaved(false);
    setProfileError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("profiles")
      .update({ name: name.trim(), phone: phone.trim() || null })
      .eq("id", user!.id);
    setSavingProfile(false);
    if (error) {
      setProfileError(error.message);
    } else {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSaved(false);
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match.");
      return;
    }
    setSavingPw(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPw(false);
    if (error) {
      setPwError(error.message);
    } else {
      setPwSaved(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwSaved(false), 2500);
    }
  }

  return (
    <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
      <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8 flex-wrap">
        <Link href="/" className="hover:text-dark">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/account" className="hover:text-dark">Account</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-dark">Settings</span>
      </nav>

      <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Account</p>
      <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">Settings</h1>

      <div className="mt-10 grid lg:grid-cols-[240px_1fr] gap-10">
        <AccountSidebar />

        <section className="max-w-xl space-y-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-ink-muted" />
            </div>
          ) : (
            <>
              {/* Profile */}
              <form onSubmit={saveProfile} className="border border-line rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <User className="w-4 h-4 text-dark" />
                  <h2 className="text-lg font-semibold text-dark">Profile</h2>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="block text-xs font-medium text-ink-soft mb-1.5">Full name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-line text-sm text-dark focus:outline-none focus:border-dark"
                      placeholder="Your name"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs font-medium text-ink-soft mb-1.5">Phone number</span>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      className="w-full h-11 px-4 rounded-xl border border-line text-sm text-dark focus:outline-none focus:border-dark"
                      placeholder="+44 7000 000000"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs font-medium text-ink-soft mb-1.5">Email address</span>
                    <input
                      value={email}
                      disabled
                      className="w-full h-11 px-4 rounded-xl border border-line text-sm text-ink-muted bg-surface cursor-not-allowed"
                    />
                    <span className="block text-xs text-ink-muted mt-1.5">
                      Contact support to change your email address.
                    </span>
                  </label>
                </div>

                {profileError && (
                  <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    {profileError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="mt-6 h-11 px-6 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {savingProfile ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                  ) : profileSaved ? (
                    <><Check className="w-4 h-4" /> Saved</>
                  ) : (
                    "Save changes"
                  )}
                </button>
              </form>

              {/* Password */}
              <form onSubmit={savePassword} className="border border-line rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Lock className="w-4 h-4 text-dark" />
                  <h2 className="text-lg font-semibold text-dark">Change password</h2>
                </div>

                <div className="space-y-4">
                  <label className="block">
                    <span className="block text-xs font-medium text-ink-soft mb-1.5">New password</span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full h-11 px-4 rounded-xl border border-line text-sm text-dark focus:outline-none focus:border-dark"
                      placeholder="At least 8 characters"
                    />
                  </label>
                  <label className="block">
                    <span className="block text-xs font-medium text-ink-soft mb-1.5">Confirm new password</span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      className="w-full h-11 px-4 rounded-xl border border-line text-sm text-dark focus:outline-none focus:border-dark"
                      placeholder="Re-enter password"
                    />
                  </label>
                </div>

                {pwError && (
                  <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    {pwError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingPw}
                  className="mt-6 h-11 px-6 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {savingPw ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                  ) : pwSaved ? (
                    <><Check className="w-4 h-4" /> Updated</>
                  ) : (
                    "Update password"
                  )}
                </button>
              </form>

              {/* Security note */}
              <div className="flex items-start gap-3 text-sm text-ink-soft">
                <ShieldCheck className="w-5 h-5 text-green shrink-0 mt-0.5" />
                <p>
                  Your account is protected with encrypted authentication. We recommend a unique password
                  you don&apos;t use anywhere else.
                </p>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
