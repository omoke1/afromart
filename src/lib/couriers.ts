/** UK couriers AfroMart ships with, plus a template to build a public tracking URL. */
export const COURIERS = [
  "Royal Mail",
  "DPD",
  "Evri",
  "UPS",
  "DHL",
  "Parcelforce",
] as const;

export type Courier = (typeof COURIERS)[number];

/** Build a public parcel-tracking URL for a courier + tracking number. */
export function trackingUrl(courier: string | null, tracking: string | null): string | null {
  if (!courier || !tracking) return null;
  const t = encodeURIComponent(tracking.trim());
  switch (courier) {
    case "Royal Mail":
      return `https://www.royalmail.com/track-your-item#/tracking-results/${t}`;
    case "DPD":
      return `https://track.dpd.co.uk/parcels/${t}`;
    case "Evri":
      return `https://www.evri.com/track/parcel/${t}`;
    case "UPS":
      return `https://www.ups.com/track?tracknum=${t}`;
    case "DHL":
      return `https://www.dhl.com/gb-en/home/tracking/tracking-parcel.html?tracking-id=${t}`;
    case "Parcelforce":
      return `https://www.parcelforce.com/track-trace?trackNumber=${t}`;
    default:
      return null;
  }
}
