create table if not exists public.directory_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  path text not null default '/',
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists directory_events_created_at_idx
  on public.directory_events (created_at desc);

alter table public.directory_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'directory_events' and policyname = 'directory_events_insert_public'
  ) then
    create policy directory_events_insert_public
      on public.directory_events
      for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;
