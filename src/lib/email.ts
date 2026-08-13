// Resend email sending. Falls back to logging the code in dev when
// RESEND_API_KEY is not set, so the app stays usable locally.

const RESEND_ENDPOINT = "https://api.resend.com/emails";

export async function sendLoginCodeEmail(to: string, code: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[dev] Login code for ${to}: ${code}`);
    return;
  }

  const from = process.env.RESEND_FROM ?? "AfroMart <onboarding@resend.dev>";

  const res = await fetch(RESEND_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Your AfroMart login code",
      html: `
        <div style="background:#fafaf7;padding:32px 16px;font-family:Helvetica,Arial,sans-serif;">
          <div style="max-width:440px;margin:0 auto;background:#ffffff;border:1px solid #e6e1d6;border-radius:16px;padding:32px;">
            <p style="font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:#8a8a8a;margin:0 0 8px;">AfroMart</p>
            <h1 style="font-size:20px;color:#1E000C;margin:0 0 12px;">Your login code</h1>
            <p style="font-size:14px;color:#555555;margin:0 0 24px;">Use the code below to sign in. It expires in 10 minutes.</p>
            <div style="background:#f4f1ea;border-radius:12px;padding:20px;text-align:center;font-size:32px;font-weight:700;letter-spacing:8px;color:#FF4200;">${code}</div>
            <p style="font-size:12px;color:#8a8a8a;margin:24px 0 0;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    }),
  });

  if (!res.ok) {
    throw new Error(`Failed to send email (${res.status})`);
  }
}
