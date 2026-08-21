"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

type Props = {
  endpoint: string;
  confirmTitle?: string;
  confirmBody?: string;
  onDeleted?: () => void;
};

export function ConfirmDeleteButton({
  endpoint,
  confirmTitle = "Delete this item?",
  confirmBody = "This will permanently remove it. This cannot be undone.",
  onDeleted,
}: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data.error ?? "Could not delete.", "error");
        return;
      }
      toast("Deleted.");
      onDeleted?.();
      router.refresh();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs text-red/70 hover:text-red"
        aria-label="Delete"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold text-dark mb-2">{confirmTitle}</h3>
            <p className="text-sm text-ink-soft mb-6">{confirmBody}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setOpen(false)}
                disabled={busy}
                className="h-9 px-4 rounded-full border border-[#e6e1d6] text-xs font-medium text-dark hover:bg-[#f4f1ea] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirm}
                disabled={busy}
                className="h-9 px-4 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {busy ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
