import ProductDetailPage from "@/app/shop/[id]/page";

export default function ProductSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  return ProductDetailPage({ params: params.then(({ slug }) => ({ id: slug })) });
}
