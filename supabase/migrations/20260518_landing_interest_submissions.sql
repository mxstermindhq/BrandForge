create table if not exists public.landing_interest_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  intent text not null check (intent in ('hire', 'get_hired')),
  source text not null default 'landing',
  created_at timestamptz not null default now()
);

alter table public.landing_interest_submissions enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'landing_interest_submissions'
      and policyname = 'landing_interest_insert_public'
  ) then
    create policy landing_interest_insert_public
      on public.landing_interest_submissions
      for insert
      to anon, authenticated
      with check (true);
  end if;
end $$;
