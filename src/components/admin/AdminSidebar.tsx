"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Users,
  FileText,
  UtensilsCrossed,
  Truck,
  Coins,
  Shield,
  Settings,
  Megaphone,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Shipping", href: "/admin/shipping", icon: Truck },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Broadcast", href: "/admin/broadcast", icon: Megaphone },
  { label: "Blog", href: "/admin/blog", icon: FileText },
  { label: "Recipes", href: "/admin/recipes", icon: UtensilsCrossed },
  { label: "Currencies", href: "/admin/currencies", icon: Coins },
  { label: "Admins", href: "/admin/admins", icon: Shield },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className={`lg:hidden fixed top-4 left-4 z-[60] w-9 h-9 rounded-lg bg-dark text-white flex items-center justify-center shadow-md ${
          open ? "hidden" : ""
        }`}
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`w-56 bg-dark text-white flex flex-col shrink-0 min-h-screen transition-transform lg:translate-x-0 lg:static fixed inset-y-0 left-0 z-50 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-white/10 shrink-0">
          <svg viewBox="0 0 32 32" fill="none" className="w-7 h-7 shrink-0">
            <rect width="32" height="32" rx="7" fill="white" />
            <path d="M10 13 C10 9.5 13 7.5 16 7.5 C19 7.5 22 9.5 22 13" stroke="#FF4200" strokeWidth="2" strokeLinecap="round" fill="none" />
            <rect x="7" y="13" width="18" height="12" rx="2.5" fill="#FF4200" />
          </svg>
          <span className="font-semibold text-sm tracking-tight">AfroMart</span>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden ml-auto text-white/60 hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors " +
                  (active
                    ? "bg-white/10 text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5")
                }
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View shop
          </Link>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/5 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
