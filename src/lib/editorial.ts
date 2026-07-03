export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Recipes" | "Community" | "Ingredients" | "Tips";
  readTime: string;
  emoji: string;
  bg: string;
  author: string;
  date: string;
  body: string[];
};

export type Recipe = {
  slug: string;
  title: string;
  time: string;
  serves: number;
  level: "Easy" | "Medium" | "Hard";
  emoji: string;
  bg: string;
  intro: string;
  ingredients: { name: string; productId?: string; amount: string }[];
  steps: string[];
};

export type Order = {
  id: string;
  date: string;
  status: "Delivered" | "Out for delivery" | "Preparing";
  items: { productId: string; qty: number }[];
  subtotal: number;
  delivery: number;
  address: {
    name: string;
    line1: string;
    city: string;
    postcode: string;
    country: string;
  };
};
