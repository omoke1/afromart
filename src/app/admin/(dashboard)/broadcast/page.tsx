"use client";

import { useEffect, useState } from "react";
import { Megaphone } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

export default function BroadcastPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [email, setEmail] = useState(false);
  const [recipients, setRecipients] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/admin/broadcast")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.recipients === "number") setRecipients(d.recipients);
      })
      .catch(() => {});
  }, []);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast("Add both a title and a message.", "error");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, link, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast(data.error ?? "Could not send.", "error");
      } else {
        const suffix = email ? ` (${data.emailed} emails sent)` : "";
        toast(`Sent to ${data.recipients} customer${data.recipients === 1 ? "" : "s"}${suffix}.`);
        setTitle("");
        setBody("");
        setLink("");
        setEmail(false);
      }
    } catch {
      toast("Could not send.", "error");
    }
    setSending(false);
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center gap-2.5">
          <Megaphone className="w-5 h-5 text-brand" />
          <h1 className="text-2xl font-bold text-dark">Broadcast</h1>
        </div>
        <p className="text-sm text-ink-muted mt-1.5">
          Send an announcement to every customer. They&apos;ll get it as an in-app notification in their
          account — and as an email if you turn the email option on.
        </p>
      </div>

      <form onSubmit={handleSend} className="grid gap-5 max-w-2xl">
        <section className="bg-white border border-[#e6e1d6] rounded-2xl p-6 grid gap-5">
          <label className="block">
            <span className="text-xs font-medium text-ink-soft">Title</span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="e.g. Fresh stock has landed"
              className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm bg-white focus:outline-none focus:border-dark"
            />
            <span className="text-xs text-ink-muted mt-1 block">{title.length}/120</span>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-ink-soft">Message</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
              rows={6}
              placeholder="Write your announcement…"
              className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm bg-white focus:outline-none focus:border-dark resize-y"
            />
            <span className="text-xs text-ink-muted mt-1 block">{body.length}/2000</span>
          </label>

          <label className="block">
            <span className="text-xs font-medium text-ink-soft">Link (optional)</span>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://afromart.xyz/shop"
              className="mt-2 w-full rounded-xl border border-line px-4 py-3 text-sm bg-white focus:outline-none focus:border-dark"
            />
            <span className="text-xs text-ink-muted mt-1 block">
              The button customers will be sent to (leave empty for no button).
            </span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={email}
              onChange={(e) => setEmail(e.target.checked)}
              className="w-4 h-4 accent-[#FF4200]"
            />
            <span className="text-sm text-dark font-medium">Also send by email</span>
          </label>
        </section>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-ink-muted">
            {recipients === null
              ? "Loading recipient count…"
              : `Will be sent to ${recipients} customer${recipients === 1 ? "" : "s"}.`}
          </p>
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-2 rounded-full bg-brand text-white px-6 py-3 text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Megaphone className="w-4 h-4" />
            {sending ? "Sending…" : "Send broadcast"}
          </button>
        </div>
      </form>
    </div>
  );
}
