import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getServerUser();
  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let name: string | null = null;
  try {
    const body = await req.json();
    name = body?.name != null ? String(body.name).trim() || null : user.name;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update({ name }).eq("id", user.id);
  if (error) return NextResponse.json({ error: "Could not update profile" }, { status: 500 });

  return NextResponse.json({ user: { ...user, name } });
}
