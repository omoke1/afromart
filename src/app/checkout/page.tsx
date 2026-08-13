"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { InteractiveCheckout } from "@/components/ui/interactive-checkout";

export default function CheckoutPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(({ user }) => {
        if (!user) {
          router.push("/login?redirect=/checkout");
        } else {
          setChecking(false);
        }
      });
  }, [router]);

  if (checking) return null;

  return (
    <main className="bg-bg min-h-screen">
      <Navbar />
      <InteractiveCheckout />
    </main>
  );
}
