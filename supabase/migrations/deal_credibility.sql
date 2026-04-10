-- Deal credibility: one outcome per funded negotiation contract (mutual win on release, mutual loss on qualifying cancel).
alter table public.profiles
  add column if not exists deal_wins integer not null default 0,
  add column if not exists deal_losses integer not null default 0;

create table if not exists public.deal_credibility_events (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.project_contracts (id) on delete cascade,
  outcome text not null check (outcome in ('mutual_win', 'mutual_loss')),
  client_id uuid not null references public.profiles (id) on delete cascade,
  provider_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (contract_id)
);

create index if not exists deal_credibility_events_client_idx
  on public.deal_credibility_events (client_id, created_at desc);

create index if not exists deal_credibility_events_provider_idx
  on public.deal_credibility_events (provider_id, created_at desc);

-- Atomic per-user counter bump (called from app after a successful event insert).
create or replace function public.apply_deal_credibility_outcome (p_user_id uuid, p_outcome text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_outcome = 'mutual_win' then
    update public.profiles
    set deal_wins = coalesce(deal_wins, 0) + 1,
        updated_at = now()
    where id = p_user_id;
  elsif p_outcome = 'mutual_loss' then
    update public.profiles
    set deal_losses = coalesce(deal_losses, 0) + 1,
        updated_at = now()
    where id = p_user_id;
  end if;
end;
$$;
