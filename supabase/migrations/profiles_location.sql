-- Optional: public profile / settings "Location" line (e.g. "San Francisco, CA")
alter table public.profiles add column if not exists location text;
