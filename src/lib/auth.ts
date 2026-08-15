import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { randomBytes, randomInt, createHash, scryptSync, timingSafeEqual, randomUUID } from "node:crypto";

export const SESSION_COOKIE = "am_session";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const CODE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CODE_ATTEMPTS = 5;

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  isAdmin: boolean;
};

// --- Password hashing (scrypt, format: salt:hash) ---
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  try {
    const candidate = scryptSync(password, salt, 64);
    return timingSafeEqual(candidate, Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

// --- One-time codes ---
export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

function hashToken(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function findOrCreateUser(email: string): Promise<{ id: string; email: string; name: string | null }> {
  const admin = createAdminClient();
  const normalized = email.trim().toLowerCase();

  const { data: existing } = await admin
    .from("profiles")
    .select("id, name, email")
    .eq("email", normalized)
    .maybeSingle();
  if (existing) {
    return { id: existing.id, email: existing.email ?? normalized, name: existing.name };
  }

  const { data: created, error } = await admin
    .from("profiles")
    .insert({ id: randomUUID(), email: normalized, name: null })
    .select("id, name, email")
    .single();
  if (error || !created) {
    throw new Error("Could not create user");
  }

  // Let the team know a brand-new customer just signed up.
  try {
    const { notifyAdmins } = await import("@/lib/notify");
    await notifyAdmins({
      type: "new_customer",
      title: "New customer signed up",
      body: normalized,
      link: `/admin/customers/${created.id}`,
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const { getAdminEmails } = await import("@/lib/notify");
    const { sendNewCustomerEmail } = await import("@/lib/email");
    const adminEmails = await getAdminEmails();
    if (adminEmails.length > 0) {
      await Promise.allSettled(
        adminEmails.map((email) =>
          sendNewCustomerEmail({
            to: email,
            customerEmail: normalized,
            link: `${siteUrl}/admin/customers/${created.id}`,
          }),
        ),
      );
    }
  } catch (err) {
    console.error("new customer notification failed:", err);
  }

  return { id: created.id, email: created.email ?? normalized, name: created.name };
}

// Issues a one-time login code and returns it so the caller can email it.
export async function issueLoginCode(email: string): Promise<string> {
  const user = await findOrCreateUser(email);
  const admin = createAdminClient();
  const code = generateCode();

  // Invalidate any previous unused codes for this user.
  await admin.from("auth_codes").delete().eq("user_id", user.id).eq("purpose", "login");

  const { error } = await admin.from("auth_codes").insert({
    user_id: user.id,
    code_hash: hashToken(code),
    purpose: "login",
    attempts: 0,
    expires_at: new Date(Date.now() + CODE_TTL_MS).toISOString(),
  });
  if (error) throw new Error("Could not issue login code");

  return code;
}

export async function verifyLoginCode(
  email: string,
  code: string,
): Promise<{ user: AuthUser } | { error: string }> {
  const admin = createAdminClient();
  const normalized = email.trim().toLowerCase();

  const { data: user } = await admin
    .from("profiles")
    .select("id, name, email")
    .eq("email", normalized)
    .maybeSingle();
  if (!user) return { error: "Invalid code" };

  const { data: codeRow } = await admin
    .from("auth_codes")
    .select("*")
    .eq("user_id", user.id)
    .eq("purpose", "login")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!codeRow) return { error: "Invalid code" };

  if (new Date(codeRow.expires_at).getTime() < Date.now()) return { error: "Code expired. Request a new one." };
  if (codeRow.attempts >= MAX_CODE_ATTEMPTS) return { error: "Too many attempts. Request a new code." };

  const candidate = Buffer.from(hashToken(code.trim()), "hex");
  const stored = Buffer.from(codeRow.code_hash, "hex");
  if (!timingSafeEqual(candidate, stored)) {
    await admin.from("auth_codes").update({ attempts: codeRow.attempts + 1 }).eq("id", codeRow.id);
    return { error: "Invalid code" };
  }

  await admin.from("auth_codes").delete().eq("id", codeRow.id);
  await admin.from("profiles").update({ email_verified_at: new Date().toISOString() }).eq("id", user.id);

  const { data: role } = await admin.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  return {
    user: { id: user.id, email: user.email ?? normalized, name: user.name, isAdmin: !!role },
  };
}

export async function passwordLogin(
  email: string,
  password: string,
): Promise<{ user: AuthUser } | { error: string }> {
  const admin = createAdminClient();
  const normalized = email.trim().toLowerCase();

  const { data: user } = await admin
    .from("profiles")
    .select("id, name, email, password_hash")
    .eq("email", normalized)
    .maybeSingle();
  if (!user || !verifyPassword(password, user.password_hash)) {
    return { error: "Incorrect email or password" };
  }

  const { data: role } = await admin.from("admin_roles").select("role").eq("user_id", user.id).maybeSingle();
  return {
    user: { id: user.id, email: user.email ?? normalized, name: user.name, isAdmin: !!role },
  };
}

// --- Sessions ---
export async function createSession(userId: string): Promise<void> {
  const admin = createAdminClient();
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  const { error } = await admin.from("sessions").insert({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt.toISOString(),
  });
  if (error) throw new Error("Could not create session");

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

/**
 * Revokes every session for a user except (optionally) the current one.
 * Called after a password change so a stolen session can't outlive it.
 */
export async function revokeOtherSessions(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const admin = createAdminClient();

  const query = admin.from("sessions").delete().eq("user_id", userId);
  if (token) {
    await query.neq("token_hash", hashToken(token));
  } else {
    await query;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const admin = createAdminClient();
    await admin.from("sessions").delete().eq("token_hash", hashToken(token));
  }
  cookieStore.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export async function getServerUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const admin = createAdminClient();
  const { data: sessionRow } = await admin
    .from("sessions")
    .select("user_id, expires_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (!sessionRow || new Date(sessionRow.expires_at).getTime() < Date.now()) return null;

  const { data: profile } = await admin
    .from("profiles")
    .select("id, name, email")
    .eq("id", sessionRow.user_id)
    .maybeSingle();
  if (!profile) return null;

  const { data: role } = await admin.from("admin_roles").select("role").eq("user_id", profile.id).maybeSingle();

  return {
    id: profile.id,
    email: profile.email ?? "",
    name: profile.name,
    isAdmin: !!role,
  };
}

export class NotSignedInError extends Error {}

export class NotAdminError extends Error {}

export async function requireUser(): Promise<AuthUser> {
  const user = await getServerUser();
  if (!user) throw new NotSignedInError();
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await requireUser();
  if (!user.isAdmin) throw new NotAdminError();
  return user;
}
