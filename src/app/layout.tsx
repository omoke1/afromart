import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { WishlistProvider } from "@/lib/wishlist";
import CartDrawer from "@/components/layout/CartDrawer";
import CartToast from "@/components/ui/CartToast";

export const metadata: Metadata = {
  title: "AfroMart — Authentic African Groceries Delivered Across the UK",
  description:
    "Shop authentic African and Nigerian groceries online. Fresh staples, spices, and more delivered to your door across the UK.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <CartProvider>
          <WishlistProvider>
            {children}
            <CartDrawer />
            <CartToast />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
