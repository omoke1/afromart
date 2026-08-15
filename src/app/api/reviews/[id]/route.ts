import { NextResponse } from "next/server";
import { getServerUser } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// Delete own review.
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getServerUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();
  const { data: review } = await admin.from("reviews").select("id").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!review) return NextResponse.json({ error: "Review not found." }, { status: 404 });

  const { error } = await admin.from("reviews").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
