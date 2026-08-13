import { NextResponse } from "next/server";
import { createSession, verifyLoginCode } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let email = "";
  let code = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim().toLowerCase();
    code = String(body?.code ?? "").trim();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!email || !code) {
    return NextResponse.json({ error: "Enter your code." }, { status: 400 });
  }

  // Per-code attempts are capped in verifyLoginCode; this stops an attacker
  // cycling fresh codes to keep guessing.
  const ip = await clientIp();
  const limited = rateLimit(`verify:ip:${ip}`, 20, 15 * 60 * 1000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  const result = await verifyLoginCode(email, code);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await createSession(result.user.id);
  return NextResponse.json({ user: result.user });
}
