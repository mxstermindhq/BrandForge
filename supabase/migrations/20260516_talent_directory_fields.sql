-- Talent directory fields on profiles
alter table public.profiles add column if not exists directory_category text;
alter table public.profiles add column if not exists rate_label text;
alter table public.profiles add column if not exists location text;

create index if not exists profiles_directory_list_idx
  on public.profiles (created_at desc)
  where username is not null and is_public = true;
