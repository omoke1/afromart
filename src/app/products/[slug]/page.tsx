import type { Metadata } from "next";
import ProductDetailPage from "@/app/shop/[id]/page";
import { createServerSupabase } from "@/lib/supabase/server";
import { productPath } from "@/lib/product-url";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.afromart.xyz";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("products")
    .select("id, slug, name, description, seo_title, seo_description, image_url")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return { title: "Product not found | AfroMart" };

  const title = data.seo_title?.trim() || `${data.name} | AfroMart`;
  const description = data.seo_description?.trim() || data.description?.trim() || `Shop ${data.name} at AfroMart.`;
  const url = `${siteUrl}${productPath({ id: data.id, slug: data.slug })}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: "AfroMart",
      ...(data.image_url ? { images: [{ url: data.image_url, alt: data.name }] } : {}),
    },
    twitter: {
      card: data.image_url ? "summary_large_image" : "summary",
      title,
      description,
      ...(data.image_url ? { images: [data.image_url] } : {}),
    },
  };
}

export default function ProductSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  return ProductDetailPage({ params: params.then(({ slug }) => ({ id: slug })) });
}
