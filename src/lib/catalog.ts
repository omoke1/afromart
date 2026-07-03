export type BadgeKind = "promo" | "best-seller" | "new";

export type Product = {
  id: string;
  name: string;
  category: string;
  categorySlug: string;
  weight: string;
  price: number;
  compareAt?: number;
  emoji: string;
  bg: string;
  badge?: BadgeKind;
  description: string;
  origin?: string;
  stock: number;
};

export type Category = {
  name: string;
  slug: string;
  emoji: string;
  bg: string;
  description: string;
};
