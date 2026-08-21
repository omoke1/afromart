"use client";

export default function PrintInvoiceButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="h-10 px-4 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors print:hidden"
    >
      Print / save as PDF
    </button>
  );
}
