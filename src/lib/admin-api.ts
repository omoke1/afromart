import { NextResponse } from "next/server";
import { requireAdmin, NotSignedInError, NotAdminError } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

export async function adminDb(): Promise<SupabaseClient<Database>> {
  await requireAdmin();
  return createAdminClient();
}

export async function handleAuthError(err: unknown): Promise<NextResponse | null> {
  if (err instanceof NotSignedInError) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }
  if (err instanceof NotAdminError) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  throw err;
}
