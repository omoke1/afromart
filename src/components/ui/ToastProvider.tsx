"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

type Toast = { id: number; message: string; type: "success" | "error" };

const ToastContext = createContext<{ toast: (message: string, type?: Toast["type"]) => void } | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const toast = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-start gap-2.5 bg-dark text-white rounded-xl px-4 py-3 shadow-lg text-sm"
          >
            {t.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-green shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 text-red-400 shrink-0" />
            )}
            <p className="flex-1 text-white/90 leading-snug">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-white/40 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
