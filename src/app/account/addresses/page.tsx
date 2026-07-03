"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus, Pencil, Trash2, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/layout/AccountSidebar";

type Address = {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
  isDefault?: boolean;
};

const initial: Address[] = [
  {
    id: "a1",
    label: "Home",
    name: "Adaeze Okonkwo",
    line1: "12 Brick Lane",
    city: "London",
    postcode: "E1 6QL",
    country: "United Kingdom",
    isDefault: true,
  },
  {
    id: "a2",
    label: "Mum's place",
    name: "Ngozi Okonkwo",
    line1: "Flat 4, 88 Old Kent Road",
    city: "London",
    postcode: "SE1 5JL",
    country: "United Kingdom",
  },
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(initial);

  const makeDefault = (id: string) =>
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  const remove = (id: string) => setAddresses((prev) => prev.filter((a) => a.id !== id));

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />

      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 lg:pt-12 pb-20 flex-1">
        <nav className="flex items-center gap-2 text-sm text-ink-muted mb-8 flex-wrap">
          <Link href="/" className="hover:text-dark">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/account" className="hover:text-dark">Account</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-dark">Addresses</span>
        </nav>

        <p className="text-[11px] tracking-[0.22em] uppercase text-ink-muted mb-2">Account</p>
        <h1 className="text-3xl lg:text-4xl font-semibold text-dark tracking-tight">Saved addresses</h1>

        <div className="mt-10 grid lg:grid-cols-[240px_1fr] gap-10">
          <AccountSidebar />

          <section>
            <div className="grid sm:grid-cols-2 gap-5">
              {addresses.map((a) => (
                <div key={a.id} className="border border-line rounded-2xl p-5 relative">
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted">{a.label}</p>
                    {a.isDefault && (
                      <span className="text-[10px] font-semibold text-dark bg-gold px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-dark">{a.name}</p>
                  <p className="text-sm text-ink-soft mt-1">{a.line1}</p>
                  {a.line2 && <p className="text-sm text-ink-soft">{a.line2}</p>}
                  <p className="text-sm text-ink-soft">{a.city}, {a.postcode}</p>
                  <p className="text-sm text-ink-soft">{a.country}</p>

                  <div className="mt-5 flex items-center gap-3 text-sm">
                    <button className="font-medium text-dark hover:text-brand flex items-center gap-1.5">
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    {!a.isDefault && (
                      <button
                        onClick={() => makeDefault(a.id)}
                        className="text-ink-soft hover:text-dark"
                      >
                        Make default
                      </button>
                    )}
                    <button
                      onClick={() => remove(a.id)}
                      className="ml-auto text-ink-muted hover:text-brand flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              <button className="border border-dashed border-line rounded-2xl p-5 flex flex-col items-center justify-center text-ink-soft hover:border-dark hover:text-dark transition-colors min-h-[180px]">
                <Plus className="w-6 h-6 mb-2" />
                <span className="font-medium">Add a new address</span>
              </button>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}
