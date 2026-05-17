-- Talent directory + profile editor fields on profiles
-- Run in Supabase SQL Editor if migrations are not auto-applied.

alter table public.profiles add column if not exists availability text;
update public.profiles set availability = 'available' where availability is null;
alter table public.profiles alter column availability set default 'available';
alter table public.profiles alter column availability set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_availability_check'
  ) then
    alter table public.profiles
      add constraint profiles_availability_check
      check (availability in ('available', 'busy', 'unavailable'));
  end if;
end $$;

alter table public.profiles add column if not exists directory_category text;
alter table public.profiles add column if not exists rate_label text;
alter table public.profiles add column if not exists location text;
alter table public.profiles add column if not exists banner_url text;

create index if not exists profiles_directory_list_idx
  on public.profiles (created_at desc)
  where username is not null and is_public = true;
