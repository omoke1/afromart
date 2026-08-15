// Resend email sending. Falls back to logging in dev when RESEND_API_KEY is not
// set, so the app stays usable locally.

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

function shell({ title, children }: { title: string; children: string }) {
  return `
    <div style="background:#fafaf7;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
      <div style="max-width:440px;margin:0 auto;background:#ffffff;border:1px solid #e6e1d6;border-radius:16px;padding:32px;">
        <p style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8a8a8a;margin:0 0 8px;">AfroMart</p>
        <h1 style="font-size:20px;color:#1E000C;margin:0 0 16px;">${title}</h1>
        ${children}
      </div>
    </div>
  `;
}

export async function sendLoginCodeEmail(to: string, code: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Your AfroMart login code",
    html: shell({
      title: "Your login code",
      children: `
        <p style="font-size:14px;color:#555555;margin:0 0 24px;">Use the code below to sign in. It expires in 10 minutes.</p>
        <div style="background:#f4f1ea;border-radius:12px;padding:20px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;color:#FF4200;">${code}</div>
        <p style="font-size:12px;color:#8a8a8a;margin:24px 0 0;">If you didn't request this code, you can safely ignore this email.</p>
      `,
    }),
  });
}

export async function sendOrderStatusEmail({
  to,
  orderId,
  status,
  total,
  link,
}: {
  to: string;
  orderId: string;
  status: string;
  total: number;
  link: string;
}): Promise<void> {
  const statusCopy: Record<string, string> = {
    Preparing: "Your order is being prepared",
    "Out for delivery": "Your order is on its way",
    Delivered: "Your order has been delivered",
    Cancelled: "Your order has been cancelled",
    Refunded: "Your refund has been issued",
  };
  await sendEmail({
    to,
    subject: `${statusCopy[status] ?? "Order update"} — ${orderId}`,
    html: shell({
      title: statusCopy[status] ?? "Order update",
      children: `
        <p style="font-size:14px;color:#555555;margin:0 0 8px;">Order <strong>${orderId}</strong> · £${total.toFixed(2)}</p>
        <p style="font-size:14px;color:#555555;margin:0 0 24px;">You can follow the progress of your order in your account.</p>
        <a href="${link}" style="display:inline-block;background:#1E000C;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:999px;">View order</a>
      `,
    }),
  });
}

export async function sendAdminNewOrderEmail({
  to,
  orderId,
  total,
  customerName,
  link,
}: {
  to: string;
  orderId: string;
  total: number;
  customerName: string;
  link: string;
}): Promise<void> {
  await sendEmail({
    to,
    subject: `New order ${orderId} — £${total.toFixed(2)}`,
    html: shell({
      title: "New order received",
      children: `
        <p style="font-size:14px;color:#555555;margin:0 0 8px;">A new order has just been placed.</p>
        <p style="font-size:14px;color:#555555;margin:0 0 4px;">Order: <strong>${orderId}</strong></p>
        <p style="font-size:14px;color:#555555;margin:0 0 4px;">Total: <strong>£${total.toFixed(2)}</strong></p>
        <p style="font-size:14px;color:#555555;margin:0 0 24px;">Customer: ${customerName}</p>
        <a href="${link}" style="display:inline-block;background:#FF4200;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:999px;">Open in admin</a>
      `,
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
      title: "Low stock alert",
      children: `
        <p style="font-size:14px;color:#555555;margin:0 0 8px;"><strong>${productName}</strong> is down to <strong>${stock}</strong> units.</p>
        <p style="font-size:14px;color:#555555;margin:0 0 24px;">Consider restocking before it sells out.</p>
        <a href="${link}" style="display:inline-block;background:#1E000C;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 24px;border-radius:999px;">Open product</a>
      `,
    }),
  });
}
