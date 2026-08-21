export function productPath(product: { id: string; slug?: string | null }): string {
  return `/products/${product.slug || product.id}`;
}
