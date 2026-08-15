import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.afromart.xyz";

const STATIC_PAGES = [
  "",
  "/shop",
  "/gift-cards",
  "/deals",
  "/charity",
  "/blog",
  "/recipes",
  "/about",
  "/contact",
  "/faq",
  "/delivery-info",
  "/returns",
  "/track-order",
  "/terms",
  "/privacy",
  "/cookies",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const admin = createAdminClient();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PAGES.map((path) => ({
    url: `${BASE}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const [products, categories, blog, recipes] = await Promise.all([
    admin.from("products").select("id, updated_at, is_active"),
    admin.from("categories").select("slug, created_at"),
    admin.from("blog_posts").select("slug, created_at"),
    admin.from("recipes").select("slug, created_at"),
  ]);

  const productEntries: MetadataRoute.Sitemap = (products.data ?? [])
    .filter((p) => p.is_active)
    .map((p) => ({
      url: `${BASE}/shop/${p.id}`,
      lastModified: p.updated_at,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

  const categoryEntries: MetadataRoute.Sitemap = (categories.data ?? []).map((c) => ({
    url: `${BASE}/shop?category=${c.slug}`,
    lastModified: c.created_at,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const blogEntries: MetadataRoute.Sitemap = (blog.data ?? []).map((b) => ({
    url: `${BASE}/blog/${b.slug}`,
    lastModified: b.created_at,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const recipeEntries: MetadataRoute.Sitemap = (recipes.data ?? []).map((r) => ({
    url: `${BASE}/recipes/${r.slug}`,
    lastModified: r.created_at,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    ...staticEntries,
    ...productEntries,
    ...categoryEntries,
    ...blogEntries,
    ...recipeEntries,
  ];
}
