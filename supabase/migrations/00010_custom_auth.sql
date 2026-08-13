-- Custom authentication (replaces Supabase Auth).
-- Supabase stays as the database, but users/sessions are managed in-app:
-- profiles becomes the users table, auth_codes holds one-time login codes,
-- sessions holds httpOnly-cookie session tokens.

-- Detach profiles from Supabase's auth.users so we control user creation.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE admin_roles DROP CONSTRAINT IF EXISTS admin_roles_user_id_fkey;

-- Extra columns for custom auth on the users table.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;

-- One-time login codes (only a SHA-256 hash is stored).
CREATE TABLE IF NOT EXISTS auth_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  purpose TEXT NOT NULL DEFAULT 'login' CHECK (purpose IN ('login', 'verify')),
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_codes_user ON auth_codes(user_id, created_at DESC);

-- Sessions (only a SHA-256 hash of the token is stored; the raw token lives
-- in an httpOnly cookie).
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);

-- Housekeeping: purge expired codes and sessions.
CREATE OR REPLACE FUNCTION cleanup_expired_auth()
RETURNS void AS $$
BEGIN
  DELETE FROM auth_codes WHERE expires_at < now();
  DELETE FROM sessions WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- With custom auth there is no Supabase JWT, so the client anon key can no
-- longer satisfy auth.uid()-based RLS on user data. Keep RLS enabled as a
-- safety net; all user-scoped reads/writes go through service-role API routes.
