-- Track guided onboarding completion; existing rows treated as already onboarded.
-- Run this entire file in Supabase → SQL Editor if you see:
-- "Could not find the 'onboarding_completed_at' column of 'profiles' in the schema cache"

alter table public.profiles add column if not exists onboarding_completed_at timestamptz;

update public.profiles
set onboarding_completed_at = coalesce(onboarding_completed_at, created_at);

-- Nudge PostgREST to pick up the column (helps clear "schema cache" errors immediately)
notify pgrst, 'reload schema';
