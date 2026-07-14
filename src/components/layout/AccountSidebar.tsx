"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Package, MapPin, Heart, CreditCard, LogOut, User, Menu, Settings } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const items = [
  { label: "Overview", href: "/account", icon: User },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Addresses", href: "/account/addresses", icon: MapPin },
  { label: "Wishlist", href: "/wishlist", icon: Heart },
  { label: "Payment methods", href: "/account/payment", icon: CreditCard },
  { label: "Settings", href: "/account/settings", icon: Settings },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="space-y-1">
      <button
        className="lg:hidden flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full text-ink-soft hover:bg-surface hover:text-dark transition-colors"
        onClick={() => setOpen(!open)}
      >
        <Menu className="w-4 h-4" />
        {open ? "Close menu" : "Menu"}
      </button>

      <div className={`${open ? "block" : "hidden"} lg:block space-y-1`}>
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            item.href === "/account"
              ? pathname === "/account"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setOpen(false)}
              className={
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors " +
                (active
                  ? "bg-dark text-white font-medium"
                  : "text-ink-soft hover:bg-surface hover:text-dark")
              }
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
        <div className="my-3 border-t border-line" />
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-muted hover:bg-surface hover:text-dark transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </nav>
  );
}
