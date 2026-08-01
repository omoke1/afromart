export type ShippingSettings = {
  base_fee: number;
  per_kg_fee: number;
  free_delivery_threshold: number;
  enabled: boolean;
};

export function parseWeightKg(weight: string | null | undefined): number | null {
  if (!weight) return null;

  const normalized = weight
    .trim()
    .toLowerCase()
    .replace(/,/g, ".")
    .replace(/\s+/g, " ");

  const patterns: Array<[RegExp, (value: number) => number]> = [
    [/^([\d.]+)\s*kg$/, (value) => value],
    [/^([\d.]+)\s*g$/, (value) => value / 1000],
    [/^([\d.]+)\s*grams?$/, (value) => value / 1000],
    [/^([\d.]+)\s*lbs?$/, (value) => value * 0.45359237],
    [/^([\d.]+)\s*oz$/, (value) => value * 0.0283495231],
  ];

  for (const [regex, converter] of patterns) {
    const match = normalized.match(regex);
    if (match) {
      const parsed = Number(match[1]);
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        return converter(parsed);
      }
    }
  }

  const numericMatch = normalized.match(/^([\d.]+)$/);
  if (numericMatch) {
    const value = Number(numericMatch[1]);
    return Number.isFinite(value) ? value : null;
  }

  return null;
}

export function calculateShippingFee(totalKg: number, settings?: Partial<ShippingSettings>): number {
  if (totalKg <= 0) return 0;
  const baseFee = settings?.base_fee ?? 4.99;
  const perKg = settings?.per_kg_fee ?? 1.25;
  const enabled = settings?.enabled ?? true;

  if (!enabled) return 0;

  const fee = baseFee + Math.max(0, totalKg - 1) * perKg;
  return Number(fee.toFixed(2));
}
