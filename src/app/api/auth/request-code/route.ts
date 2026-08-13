import { NextResponse } from "next/server";
import { issueLoginCode } from "@/lib/auth";
import { sendLoginCodeEmail } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let email = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!email || !email.includes("@") || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // Stop code-spamming a victim's inbox, and stop bulk account probing.
  const ip = await clientIp();
  for (const [key, limit] of [
    [`code:email:${email}`, 5],
    [`code:ip:${ip}`, 20],
  ] as const) {
    const limited = rateLimit(key, limit, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many code requests. Try again in a few minutes." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
      );
    }
  }

  try {
    const code = await issueLoginCode(email);
    await sendLoginCodeEmail(email, code);
  } catch (err) {
    // Log server-side, but never leak whether the address exists.
    console.error("request-code failed:", err);
  }

  // Always the same response, so this endpoint can't be used to discover
  // which email addresses have accounts.
  return NextResponse.json({ ok: true });
}
