import { NextResponse } from "next/server";
import { adminDb, handleAuthError } from "@/lib/admin-api";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = await adminDb();
    const { data: roles, error } = await db
      .from("admin_roles")
      .select("id, role, user_id, created_at")
      .order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const ids = (roles ?? []).map((r) => r.user_id);
    let profiles: { id: string; name: string | null; email: string }[] = [];
    if (ids.length > 0) {
      const { data, error: profileErr } = await db
        .from("profiles")
        .select("id, name, email")
        .in("id", ids);
      if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });
      profiles = (data ?? []) as typeof profiles;
    }

    const profileMap = new Map(profiles.map((p) => [p.id, p]));
    const admins = (roles ?? []).map((r) => ({
      ...r,
      profiles: profileMap.get(r.user_id) ?? null,
    }));

    return NextResponse.json({ admins });
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await adminDb();
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();
    const role = String(body?.role ?? "admin").trim();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (!["admin", "superadmin"].includes(role)) {
      return NextResponse.json({ error: "Role must be 'admin' or 'superadmin'." }, { status: 400 });
    }

    const { data: profile } = await db
      .from("profiles")
      .select("id, email, name")
      .eq("email", email)
      .maybeSingle();
    if (!profile) {
      return NextResponse.json(
        { error: "No account found with that email. The person must sign in to the shop first." },
        { status: 404 },
      );
    }

    const { data: existing } = await db
      .from("admin_roles")
      .select("id")
      .eq("user_id", profile.id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "That person is already an admin." }, { status: 409 });
    }

    const { data: inserted, error } = await db
      .from("admin_roles")
      .insert({ user_id: profile.id, role })
      .select("id, role, user_id, created_at")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json(
      { admin: { ...inserted, profiles: profile } },
      { status: 201 },
    );
  } catch (err) {
    const res = await handleAuthError(err);
    return res ?? NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
