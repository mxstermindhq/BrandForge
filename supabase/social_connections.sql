-- OAuth-connected social accounts (tokens are server-only; never exposed to the browser).
-- Run in Supabase SQL Editor if this table is not already present.

create table if not exists public.social_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null check (
    provider in ('linkedin', 'x', 'instagram', 'facebook', 'youtube', 'tiktok', 'substack')
  ),
  provider_account_id text,
  display_name text,
  scopes text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'revoked', 'error')),
  token_expires_at timestamptz,
  access_token text,
  refresh_token text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create index if not exists social_connections_user_idx
  on public.social_connections (user_id);

alter table public.social_connections enable row level security;

-- No direct client access to tokens; the API uses the service role. Keep RLS with zero policies
-- so anon/authenticated cannot read/write; service role bypasses RLS.
