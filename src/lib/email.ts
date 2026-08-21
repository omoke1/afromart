// Resend email sending. Falls back to logging in dev when RESEND_API_KEY is not
// set, so the app stays usable locally.

import { trackingUrl } from "@/lib/couriers";

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[dev] Email to ${to}: ${subject}`);
    return;
  }

  const from = process.env.RESEND_FROM ?? "AfroMart <onboarding@resend.dev>";

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send email (${res.status})`);
  }
}

type Cta = { href: string; label: string; bg?: string };

const BRAND = "#1E000C";
const ACCENT = "#FF4200";
const INK = "#1E000C";
const SOFT = "#555555";
const MUTED = "#8a8a8a";
const LINE = "#e6e1d6";
const FAINT = "#f0ede4";
const TINT = "#f4f1ea";

function button({ href, label, bg = ACCENT }: Cta) {
  return `
    <div style="margin-top:24px;">
      <a href="${href}" style="display:inline-block;background:${bg};color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:999px;">${label}</a>
    </div>
  `;
}

function kvRow(label: string, value: string, bold = false) {
  return `
    <tr>
      <td style="padding:6px 0;font-size:13px;color:${MUTED};">${label}</td>
      <td style="padding:6px 0;font-size:13px;color:${bold ? INK : SOFT};text-align:right;font-weight:${bold ? 700 : 400};">${value}</td>
    </tr>
  `;
}

function itemsTable(items: { name: string; qty: number; unitPrice: number }[]) {
  return `
    <table style="width:100%;border-collapse:collapse;margin:20px 0 0;font-size:13px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 0;border-bottom:1px solid ${LINE};color:${MUTED};font-weight:500;">Item</th>
          <th style="text-align:center;padding:8px 0;border-bottom:1px solid ${LINE};color:${MUTED};font-weight:500;">Qty</th>
          <th style="text-align:right;padding:8px 0;border-bottom:1px solid ${LINE};color:${MUTED};font-weight:500;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (i) => `
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid ${FAINT};color:${INK};">${i.name}</td>
            <td style="padding:8px 0;border-bottom:1px solid ${FAINT};color:${SOFT};text-align:center;">${i.qty}</td>
            <td style="padding:8px 0;border-bottom:1px solid ${FAINT};color:${INK};text-align:right;">£${(i.unitPrice * i.qty).toFixed(2)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function shell({
  eyebrow,
  title,
  children,
  cta,
}: {
  eyebrow?: string;
  title: string;
  children: string;
  cta?: Cta;
}) {
  return `
    <div style="background:#fafaf7;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
      <div style="max-width:480px;margin:0 auto;">
        <div style="background:#ffffff;border:1px solid ${LINE};border-radius:16px;overflow:hidden;">
          <div style="background:${BRAND};padding:18px 28px;">
            <p style="margin:0;color:#ffffff;font-size:13px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;">AfroMart</p>
          </div>
          <div style="padding:28px;">
            ${eyebrow ? `<p style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${ACCENT};margin:0 0 8px;font-weight:600;">${eyebrow}</p>` : ""}
            <h1 style="font-size:22px;color:${INK};margin:0 0 16px;line-height:1.3;">${title}</h1>
            ${children}
            ${cta ? button(cta) : ""}
          </div>
        </div>
        <p style="text-align:center;font-size:12px;color:${MUTED};margin:20px 0 0;">AfroMart · <a href="https://afromart.xyz" style="color:${MUTED};">www.afromart.xyz</a></p>
      </div>
    </div>
  `;
}

function orderLine(orderId: string, total: number) {
  return `
    <div style="background:${TINT};border-radius:12px;padding:12px 16px;font-size:13px;color:${SOFT};margin:0 0 20px;">
      Order <strong style="color:${INK};">${orderId}</strong> · <strong style="color:${INK};">£${total.toFixed(2)}</strong>
    </div>
  `;
}

// --- Customer emails -------------------------------------------------------

export async function sendLoginCodeEmail(to: string, code: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Your AfroMart login code",
    html: shell({
      eyebrow: "Sign in",
      title: "Your login code",
      children: `
        <p style="font-size:14px;color:${SOFT};margin:0 0 20px;">Use the code below to sign in to your AfroMart account. It expires in 10 minutes.</p>
        <div style="background:${TINT};border-radius:12px;padding:20px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;color:${INK};">${code}</div>
        <p style="font-size:12px;color:${MUTED};margin:20px 0 0;">If you didn't request this code, you can safely ignore this email.</p>
      `,
    }),
  });
}

export async function sendOrderConfirmationEmail({
  to,
  customerName,
  orderId,
  items,
  subtotal,
  delivery,
  discount,
  total,
  trackingNumber,
  link,
}: {
  to: string;
  customerName: string;
  orderId: string;
  items: { name: string; qty: number; unitPrice: number }[];
  subtotal: number;
  delivery: number;
  discount?: number;
  total: number;
  trackingNumber?: string | null;
  link: string;
}): Promise<void> {
  await sendEmail({
    to,
    subject: `Payment received — order ${orderId}`,
    html: shell({
      eyebrow: "Order confirmation",
      title: "Thanks — your payment went through",
      children: `
        <p style="font-size:14px;color:${SOFT};margin:0 0 4px;">Hi ${customerName},</p>
        <p style="font-size:14px;color:${SOFT};margin:0 0 20px;">We've received your payment for the order below and we're getting everything ready for you.</p>
        ${itemsTable(items)}
        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
          ${kvRow("Subtotal", `£${subtotal.toFixed(2)}`)}
          ${discount && discount > 0 ? kvRow("Discount", `−£${discount.toFixed(2)}`, true) : ""}
          ${kvRow("Delivery", delivery === 0 ? "Free" : `£${delivery.toFixed(2)}`)}
          ${kvRow("Total", `£${total.toFixed(2)}`, true)}
        </table>
        ${trackingNumber ? `<p style="font-size:12px;color:${MUTED};margin:16px 0 0;">AfroMart tracking reference: <strong style="color:${INK};">${trackingNumber}</strong>. We'll send courier tracking details once your order ships.</p>` : ""}
      `,
      cta: { href: link, label: "View your order", bg: BRAND },
    }),
  });
}

const STATUS_COPY: Record<string, { title: string; body: string }> = {
  Preparing: {
    title: "Your order is being prepared",
    body: "We're getting your order ready and it will be on its way to you soon.",
  },
  "Out for delivery": {
    title: "Your order is on its way",
    body: "Your order has left us and is out for delivery.",
  },
  Delivered: {
    title: "Your order has been delivered",
    body: "Your order has been delivered. Enjoy — and thank you for shopping with AfroMart.",
  },
  Cancelled: {
    title: "Your order has been cancelled",
    body: "Your order was cancelled. If you have any questions, get in touch and we'll help.",
  },
  Refunded: {
    title: "Your refund has been issued",
    body: "Your refund has been processed. It can take 3–5 working days to appear in your account.",
  },
  "Ready for pickup": {
    title: "Your order is ready for pickup",
    body: "Your order has arrived and is ready to collect. Please bring your order reference and a form of ID. We'll hold it for you.",
  },
};

export async function sendOrderStatusEmail({
  to,
  orderId,
  status,
  total,
  link,
  courier,
  trackingNumber,
  estimatedDelivery,
}: {
  to: string;
  orderId: string;
  status: string;
  total: number;
  link: string;
  courier?: string | null;
  trackingNumber?: string | null;
  estimatedDelivery?: string | null;
}): Promise<void> {
  const copy = STATUS_COPY[status] ?? {
    title: "Order update",
    body: `Your order ${orderId} has an update.`,
  };

  const estBlock = estimatedDelivery
    ? `<p style="font-size:14px;color:${SOFT};margin:0 0 4px;">Estimated delivery: <strong style="color:${INK};">${new Date(estimatedDelivery).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</strong></p>`
    : "";

  const trackUrl = trackingUrl(courier ?? null, trackingNumber ?? null);
  const trackingBlock =
    courier && trackingNumber
      ? `
      <div style="background:${TINT};border-radius:12px;padding:16px 18px;margin-top:20px;font-size:13px;">
        <p style="margin:0 0 8px;font-weight:600;color:${INK};">Tracking details</p>
        <p style="margin:0 0 2px;color:${SOFT};">Courier: ${courier}</p>
        <p style="margin:0 0 12px;color:${SOFT};">Tracking number: <strong style="color:${INK};">${trackingNumber}</strong></p>
        ${trackUrl ? `<a href="${trackUrl}" style="display:inline-block;background:${ACCENT};color:#ffffff;text-decoration:none;font-size:13px;font-weight:600;padding:10px 18px;border-radius:999px;">Track your parcel</a>` : ""}
      </div>
    `
      : "";

  await sendEmail({
    to,
    subject: `${copy.title} — ${orderId}`,
    html: shell({
      eyebrow: "Order update",
      title: copy.title,
      children: `
        <p style="font-size:14px;color:${SOFT};margin:0 0 20px;">${copy.body}</p>
        ${orderLine(orderId, total)}
        ${estBlock}
        ${trackingBlock}
      `,
      cta: { href: link, label: "View your order", bg: BRAND },
    }),
  });
}

// --- Admin emails ----------------------------------------------------------

export async function sendAdminNewOrderEmail({
  to,
  orderId,
  total,
  customerName,
  itemCount,
  link,
}: {
  to: string;
  orderId: string;
  total: number;
  customerName: string;
  itemCount?: number;
  link: string;
}): Promise<void> {
  await sendEmail({
    to,
    subject: `New order ${orderId} — £${total.toFixed(2)}`,
    html: shell({
      eyebrow: "New sale",
      title: "New order received",
      children: `
        <p style="font-size:14px;color:${SOFT};margin:0 0 20px;">
          ${customerName} just placed a new order${itemCount ? ` with ${itemCount} item${itemCount === 1 ? "" : "s"}` : ""}.
        </p>
        <table style="width:100%;border-collapse:collapse;">
          ${kvRow("Order", orderId)}
          ${kvRow("Customer", customerName)}
          ${kvRow("Total", `£${total.toFixed(2)}`, true)}
        </table>
      `,
      cta: { href: link, label: "Open in admin" },
    }),
  });
}

export async function sendLowStockEmail({
  to,
  productName,
  stock,
  link,
}: {
  to: string;
  productName: string;
  stock: number;
  link: string;
}): Promise<void> {
  await sendEmail({
    to,
    subject: `Low stock: ${productName}`,
    html: shell({
      eyebrow: "Inventory alert",
      title: "Low stock alert",
      children: `
        <p style="font-size:14px;color:${SOFT};margin:0 0 4px;"><strong style="color:${INK};">${productName}</strong> is down to <strong style="color:${INK};">${stock}</strong> unit${stock === 1 ? "" : "s"}.</p>
        <p style="font-size:14px;color:${SOFT};margin:0;">Consider restocking before it sells out.</p>
      `,
      cta: { href: link, label: "View products", bg: BRAND },
    }),
  });
}

export async function sendNewCustomerEmail({
  to,
  customerEmail,
  link,
}: {
  to: string;
  customerEmail: string;
  link: string;
}): Promise<void> {
  await sendEmail({
    to,
    subject: "New customer signed up",
    html: shell({
      eyebrow: "New signup",
      title: "New customer signed up",
      children: `
        <p style="font-size:14px;color:${SOFT};margin:0;">${customerEmail} just created an AfroMart account.</p>
      `,
      cta: { href: link, label: "View customer", bg: BRAND },
    }),
  });
}

export async function sendBroadcastEmail({
  to,
  title,
  body,
  link,
}: {
  to: string;
  title: string;
  body: string;
  link?: string | null;
}): Promise<void> {
  const paragraphs = body
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map(
      (p) => `
        <p style="font-size:14px;color:${SOFT};margin:0 0 12px;">${p}</p>
      `,
    )
    .join("");

  await sendEmail({
    to,
    subject: title,
    html: shell({
      eyebrow: "AfroMart announcement",
      title,
      children: paragraphs,
      cta: link ? { href: link, label: "Find out more", bg: BRAND } : undefined,
    }),
  });
}

// Sent to a customer who left items in their cart (via the abandoned-cart cron).
export async function sendAbandonedCartEmail({
  to,
  customerName,
  items,
  link,
}: {
  to: string;
  customerName: string;
  items: { name: string; qty: number }[];
  link: string;
}): Promise<void> {
  const itemLines =
    items.length > 0
      ? items
          .map(
            (i) => `
            <li style="padding:8px 0;border-bottom:1px solid ${FAINT};font-size:13px;color:${INK};">
              ${i.qty}× ${i.name}
            </li>
          `,
          )
          .join("")
      : "";

  await sendEmail({
    to,
    subject: "You left something behind at AfroMart",
    html: shell({
      eyebrow: "Almost forgot",
      title: "Your basket is still waiting",
      children: `
        <p style="font-size:14px;color:${SOFT};margin:0 0 4px;">Hi ${customerName},</p>
        <p style="font-size:14px;color:${SOFT};margin:0 0 20px;">You added a few things to your basket but didn't finish checking out. Here's a quick reminder before they sell out:</p>
        ${itemLines ? `<ul style="list-style:none;margin:0 0 20px;padding:0;">${itemLines}</ul>` : ""}
      `,
      cta: { href: link, label: "Return to your basket" },
    }),
  });
}

// Delivers a purchased gift card to the recipient.
export async function sendGiftCardEmail({
  to,
  recipientName,
  senderName,
  amount,
  code,
  message,
}: {
  to: string;
  recipientName?: string | null;
  senderName?: string | null;
  amount: number;
  code: string;
  message?: string | null;
}): Promise<void> {
  const hello = recipientName ? `Hi ${recipientName},` : "Hello,";
  const messageBlock = message
    ? `<p style="font-size:14px;color:${SOFT};margin:20px 0 0;font-style:italic;">"${message}"</p>`
    : "";
  const fromBlock = senderName
    ? `<p style="font-size:12px;color:${MUTED};margin:12px 0 0;">From ${senderName}</p>`
    : "";

  await sendEmail({
    to,
    subject: `You've been gifted £${amount.toFixed(2)} at AfroMart`,
    html: shell({
      eyebrow: "A gift for you",
      title: `You've received a £${amount.toFixed(2)} AfroMart gift card`,
      children: `
        <p style="font-size:14px;color:${SOFT};margin:0 0 4px;">${hello}</p>
        <p style="font-size:14px;color:${SOFT};margin:0;">Use the code below at checkout to pay for your order. It never expires.</p>
        <div style="background:${TINT};border-radius:12px;padding:20px;text-align:center;font-size:18px;font-weight:700;letter-spacing:2px;color:${INK};margin-top:20px;">${code}</div>
        ${messageBlock}
        ${fromBlock}
        <p style="font-size:12px;color:${MUTED};margin:20px 0 0;">To spend it, add the code in the "Promo code or gift card" box at checkout.</p>
      `,
      cta: { href: "https://afromart.xyz/shop", label: "Shop at AfroMart" },
    }),
  });
}
