import { NextResponse } from "next/server";
import { createSession, passwordLogin } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let email = "";
  let password = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim().toLowerCase();
    password = String(body?.password ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  // Throttle brute-force attempts, per-IP and per-account.
  const ip = await clientIp();
  for (const key of [`login:ip:${ip}`, `login:email:${email}`]) {
    const limited = rateLimit(key, 10, 15 * 60 * 1000);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many attempts. Try again in a few minutes." },
        { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
      );
    }
  }

  const result = await passwordLogin(email, password);
  if ("error" in result) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  await createSession(result.user.id);
  return NextResponse.json({ user: result.user });
}
