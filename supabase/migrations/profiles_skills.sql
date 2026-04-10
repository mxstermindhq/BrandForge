-- Skills tags on profiles (text[]). Run in Supabase → SQL Editor if you see:
-- "Could not find the 'skills' column of 'profiles' in the schema cache"

alter table public.profiles add column if not exists skills text[] not null default '{}';

update public.profiles set skills = coalesce(skills, '{}'::text[]) where skills is null;

notify pgrst, 'reload schema';
