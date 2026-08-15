import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

const INSERT_BATCH = 500;
const EMAIL_CHUNK = 25;

export async function GET() {
  try {
    await requireAdmin();
    const db = await adminDb();
    const { data } = await db.from("profiles").select("email");
    const recipients = (data ?? []).filter((p) => p.email && String(p.email).trim()).length;
    return NextResponse.json({ recipients });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
    const db = await adminDb();

    let body: { title?: string; body?: string; link?: string; email?: boolean };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const title = String(body.title ?? "").trim();
    const message = String(body.body ?? "").trim();
    const link = String(body.link ?? "").trim() || null;
    const email = !!body.email;

    if (!title || !message) {
      return NextResponse.json({ error: "Title and message are required." }, { status: 400 });
    }
    if (title.length > 120) {
      return NextResponse.json({ error: "Title is too long (max 120 characters)." }, { status: 400 });
    }
    if (message.length > 2000) {
      return NextResponse.json({ error: "Message is too long (max 2000 characters)." }, { status: 400 });
    }
    if (link && link.length > 500) {
      return NextResponse.json({ error: "Link is too long (max 500 characters)." }, { status: 400 });
    }

    // Everyone with an email is a recipient; guest-only shoppers without an
    // email can't be reached, so they're naturally skipped.
    const { data: profiles } = await db.from("profiles").select("id, email");
    const customers = (profiles ?? []).filter((p) => p.email && String(p.email).trim());

    // In-app notification per customer (batched so large fan-outs don't blow
    // the request body size).
    const ids = customers.map((c) => c.id as string);
    for (let i = 0; i < ids.length; i += INSERT_BATCH) {
      const batch = ids.slice(i, i + INSERT_BATCH);
      const { error } = await db.from("notifications").insert(
        batch.map((userId) => ({
          scope: "user",
          user_id: userId,
          type: "announcement",
          title,
          body: message,
          link,
        })),
      );
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Optional email blast, in small chunks to stay under Resend's rate limits.
    let emailed = 0;
    if (email) {
      const { sendBroadcastEmail } = await import("@/lib/email");
      const emails = customers.map((c) => String(c.email));
      for (let i = 0; i < emails.length; i += EMAIL_CHUNK) {
        const chunk = emails.slice(i, i + EMAIL_CHUNK);
        const results = await Promise.allSettled(
          chunk.map((to) => sendBroadcastEmail({ to, title, body: message, link })),
        );
        emailed += results.filter((r) => r.status === "fulfilled").length;
      }
    }

    return NextResponse.json({ ok: true, recipients: ids.length, emailed });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
