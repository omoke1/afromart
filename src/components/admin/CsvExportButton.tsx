"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export function CsvExportButton({ url, label = "Export CSV" }: { url: string; label?: string }) {
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `afromart-export-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(objectUrl);
    } catch {
      alert("Could not export. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={download}
      disabled={busy}
      className="flex items-center gap-1.5 h-9 px-4 rounded-full border border-[#e6e1d6] text-xs font-semibold text-dark hover:bg-white transition-colors disabled:opacity-50"
    >
      <Download className="w-3.5 h-3.5" />
      {busy ? "Exporting…" : label}
    </button>
  );
}
