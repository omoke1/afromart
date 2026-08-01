export const DEFAULT_BASE_CURRENCY = "GBP";

export const SYMBOLS: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  NGN: "₦",
};

export function formatCurrency(amount: number, code = DEFAULT_BASE_CURRENCY, options?: { decimals?: number }) {
  const decimals = options?.decimals ?? 2;
  const symbol = SYMBOLS[code] ?? code;
  return `${symbol}${Number(amount).toFixed(decimals)}`;
}

export default formatCurrency;
