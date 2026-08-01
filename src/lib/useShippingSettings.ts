"use client";

import useSWR from "swr";

export type ShippingSettings = {
  base_fee: number;
  per_kg_fee: number;
  free_delivery_threshold: number;
  enabled: boolean;
};

export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  base_fee: 4.99,
  per_kg_fee: 1.25,
  free_delivery_threshold: 40,
  enabled: true,
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useShippingSettings() {
  const { data, error, isLoading } = useSWR("/api/admin/shipping-settings", fetcher, {
    revalidateOnFocus: false,
  });

  const settings = data?.data ?? DEFAULT_SHIPPING_SETTINGS;

  return { settings, error, isLoading };
}
