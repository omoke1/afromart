import { NextResponse } from "next/server";
import { getServerUser, requireUser, NotSignedInError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const user = await getServerUser();
  if (!user) {
    return NextResponse.json({ currency: null });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("currency")
    .eq("id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ currency: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ currency: data?.currency ?? null });
}

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof NotSignedInError) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    throw err;
  }

  const body = await req.json();
  const code = body?.code;
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ currency: code }).eq("id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
