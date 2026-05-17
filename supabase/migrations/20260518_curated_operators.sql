-- Curated operators source-of-truth for landing + profile pages

create table if not exists public.curated_operators (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  name text not null,
  role text not null,
  years_exp int not null default 0,
  availability text not null default 'available',
  amanah_score int not null default 0,
  completion_rate int not null default 0,
  bio text not null default '',
  best_result text not null default '',
  wont_take_on text not null default '',
  starting_price text not null default '',
  pricing_model text not null default '',
  skills jsonb not null default '[]'::jsonb,
  ideal_client text not null default '',
  work_style text not null default '',
  typical_timeline text not null default '',
  proof_link text,
  faq jsonb not null default '[]'::jsonb,
  is_verified boolean not null default false,
  layout_span text not null default 'standard',
  display_order int not null default 1000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint curated_operators_availability_check check (availability in ('available-now', 'available', 'limited', 'unavailable')),
  constraint curated_operators_amanah_check check (amanah_score between 0 and 100),
  constraint curated_operators_completion_check check (completion_rate between 0 and 100),
  constraint curated_operators_layout_span_check check (layout_span in ('featured', 'standard', 'compact'))
);

create index if not exists curated_operators_display_order_idx
  on public.curated_operators (display_order asc, created_at desc);

alter table public.curated_operators enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'curated_operators' and policyname = 'curated_operators_public_select'
  ) then
    create policy curated_operators_public_select
      on public.curated_operators
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;
