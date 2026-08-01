-- Add preferred currency column to profiles for persistence
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS currency text;
