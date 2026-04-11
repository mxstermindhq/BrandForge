-- Leaderboard / service detail / review recalculation expect this column (see schema.sql).
alter table public.profiles
  add column if not exists top_member boolean not null default false;
