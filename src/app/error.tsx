"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <div className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 pt-20 pb-20 text-center">
        <div className="text-[100px] leading-none">🌶️</div>
        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mt-4 mb-2">Something broke</p>
        <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">
          That wasn&apos;t supposed to happen.
        </h1>
        <p className="mt-4 text-ink-soft">
          An unexpected error stopped this page from loading. Try refreshing — if it keeps happening, let us know.
        </p>

        {error.digest && (
          <p className="mt-3 text-xs text-ink-muted">
            Error reference: <code className="bg-surface px-1.5 py-0.5 rounded">{error.digest}</code>
          </p>
        )}

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="h-11 px-6 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="h-11 px-6 rounded-full border border-line text-dark text-sm font-semibold hover:border-dark transition-colors flex items-center justify-center"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
