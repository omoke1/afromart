"use client";

import { useEffect, useState } from "react";

export type SiteSettings = { show_catalog_nav: boolean; show_product_breadcrumbs: boolean; show_product_categories: boolean };
const defaults: SiteSettings = { show_catalog_nav: false, show_product_breadcrumbs: false, show_product_categories: false };
let cached: SiteSettings | null = null;
let request: Promise<SiteSettings> | null = null;

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(cached ?? defaults);
  useEffect(() => {
    if (!request) {
      request = fetch("/api/site-settings").then((res) => res.json()).then((data) => {
        const next = { ...defaults, ...(data.settings ?? {}) };
        cached = next;
        return next;
      }).catch(() => defaults);
    }
    request.then(setSettings);
  }, []);
  return settings;
}
