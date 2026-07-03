"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Mail, Phone, MessageCircle, Check } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import CategoryBar from "@/components/layout/CategoryBar";
import Footer from "@/components/layout/Footer";
import PageHero from "@/components/layout/PageHero";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <main className="bg-bg min-h-screen flex flex-col">
      <Navbar />
      <CategoryBar />
      <PageHero
        eyebrow="Contact"
        title="Talk to a real human."
        blurb="We answer every message within a few hours during UK working hours. No bots, no scripts."
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        bg="var(--color-surface)"
      />

      <div className="max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex-1 grid lg:grid-cols-[1fr_380px] gap-12">
        {/* Form */}
        <section>
          {sent ? (
            <div className="border border-line rounded-2xl p-8 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-green/15 flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-green" />
              </div>
              <h2 className="text-xl font-semibold text-dark">Message sent</h2>
              <p className="mt-2 text-ink-soft text-sm">
                We&apos;ll get back to you on the email you provided. Average response time: 2 hours.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-sm font-semibold text-dark hover:text-brand"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Your name" name="name" required />
                <Field label="Email" name="email" type="email" required />
              </div>

              <label className="block">
                <span className="block text-xs font-medium text-ink-soft mb-1.5">Subject</span>
                <select
                  required
                  className="w-full h-11 px-4 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
                  defaultValue=""
                >
                  <option value="" disabled>Choose a topic</option>
                  <option>Order or delivery question</option>
                  <option>Product enquiry</option>
                  <option>Return or refund</option>
                  <option>Wholesale & partnerships</option>
                  <option>Something else</option>
                </select>
              </label>

              <Field label="Order number (optional)" name="order" placeholder="AFM-XXXXXX" />

              <label className="block">
                <span className="block text-xs font-medium text-ink-soft mb-1.5">Message</span>
                <textarea
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark resize-none"
                  placeholder="Tell us what&apos;s going on."
                />
              </label>

              <button
                type="submit"
                className="h-12 px-7 rounded-full bg-dark text-white text-sm font-semibold hover:bg-brand transition-colors"
              >
                Send message
              </button>
            </form>
          )}
        </section>

        {/* Contact options */}
        <aside className="space-y-4">
          <Channel
            icon={<Mail className="w-5 h-5 text-brand" />}
            title="Email"
            body="hello@afromart.co.uk"
            href="mailto:hello@afromart.co.uk"
            note="Replies within 2 hours, weekdays."
          />
          <Channel
            icon={<Phone className="w-5 h-5 text-brand" />}
            title="Phone"
            body="+44 20 1234 5678"
            href="tel:+442012345678"
            note="Mon–Fri, 9am–6pm UK time."
          />
          <Channel
            icon={<MessageCircle className="w-5 h-5 text-brand" />}
            title="WhatsApp"
            body="+44 7700 900123"
            href="https://wa.me/447700900123"
            note="Fastest channel for delivery updates."
          />

          <div className="border border-line rounded-2xl p-5 bg-surface">
            <p className="text-sm font-semibold text-dark">Looking for quick answers?</p>
            <p className="mt-1 text-sm text-ink-soft">Most questions are covered in our FAQs.</p>
            <Link href="/faq" className="mt-3 inline-block text-sm font-semibold text-dark hover:text-brand">
              Visit help centre →
            </Link>
          </div>
        </aside>
      </div>

      <Footer />
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-ink-soft mb-1.5">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full h-11 px-4 border border-line rounded-xl text-sm text-dark bg-white focus:outline-none focus:border-dark"
      />
    </label>
  );
}

function Channel({
  icon,
  title,
  body,
  href,
  note,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  href: string;
  note: string;
}) {
  return (
    <a
      href={href}
      className="block border border-line rounded-2xl p-5 hover:border-dark transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand/10 flex items-center justify-center">{icon}</div>
        <div>
          <p className="text-[11px] tracking-[0.14em] uppercase text-ink-muted">{title}</p>
          <p className="text-dark font-medium">{body}</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-ink-muted">{note}</p>
    </a>
  );
}
