-- BrandForge: Honor, Conquest, Rating (RP), privileges, seasons
-- Apply in Supabase SQL editor or CLI. Service role bypasses RLS for server mutations.

-- ─── Tables ───────────────────────────────────────────────────────────────

create table if not exists public.user_currencies (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  honor_points integer not null default 0 check (honor_points >= 0),
  conquest_points integer not null default 0 check (conquest_points >= 0),
  total_honor_earned integer not null default 0 check (total_honor_earned >= 0),
  total_conquest_earned integer not null default 0 check (total_conquest_earned >= 0),
  last_honor_decay_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.currency_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  currency_type text not null check (currency_type in ('honor', 'conquest')),
  amount integer not null,
  balance_after integer not null,
  action_type text not null check (
    action_type in (
      'listing_published',
      'bid_placed',
      'message_sent',
      'deal_signed',
      'review_received',
      'weekly_decay',
      'privilege_purchase'
    )
  ),
  reference_type text,
  reference_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.rating_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  rp_before integer not null,
  rp_after integer not null,
  reason text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_ratings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  current_rp integer not null default 0,
  peak_rp_season integer not null default 0,
  current_tier text not null default 'challenger' check (
    current_tier in ('challenger', 'rival', 'duelist', 'gladiator', 'undisputed')
  ),
  tier_achieved_at timestamptz,
  win_streak integer not null default 0,
  best_win_streak integer not null default 0,
  weekly_deals_closed integer not null default 0,
  last_deal_at timestamptz,
  decay_shield_until timestamptz,
  deal_wins integer not null default 0,
  deal_losses integer not null default 0,
  rp_decay_week date,
  message_rp_today integer not null default 0,
  message_rp_day date,
  updated_at timestamptz not null default now()
);

create table if not exists public.privilege_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  currency_type text not null check (currency_type in ('honor', 'conquest', 'both')),
  honor_cost integer not null default 0 check (honor_cost >= 0),
  conquest_cost integer not null default 0 check (conquest_cost >= 0),
  category text,
  is_active boolean not null default true,
  duration_days integer,
  created_at timestamptz not null default now()
);

create table if not exists public.user_privileges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  privilege_slug text not null references public.privilege_catalog (slug),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  granted_by text not null default 'purchase' check (granted_by in ('purchase', 'admin', 'season_reward')),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  competitive_starts_at timestamptz not null,
  prize_pool_usd numeric(10, 2) not null default 24500.00,
  payout_structure jsonb not null default '[8000,5000,3500,2500,1800,1200,900,700,500,400]'::jsonb,
  tier_floors jsonb not null default '{"challenger":0,"rival":1200,"duelist":1800,"gladiator":2400,"undisputed":2800}'::jsonb,
  decay_rate numeric not null default 0.05,
  rp_decay_rate numeric not null default 0.02,
  competitive_mode boolean not null default false,
  status text not null default 'active' check (status in ('active', 'ended', 'draft'))
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────

create index if not exists currency_ledger_user_currency_created_idx
  on public.currency_ledger (user_id, currency_type, created_at desc);

create index if not exists user_currencies_honor_desc_idx
  on public.user_currencies (honor_points desc);

create index if not exists user_currencies_conquest_desc_idx
  on public.user_currencies (conquest_points desc);

create index if not exists user_ratings_current_rp_desc_idx
  on public.user_ratings (current_rp desc);

create index if not exists user_ratings_win_streak_desc_idx
  on public.user_ratings (win_streak desc);

create index if not exists user_privileges_user_expires_idx
  on public.user_privileges (user_id, expires_at);

-- ─── Helpers ───────────────────────────────────────────────────────────────

create or replace function public._utc_week_start_ts()
returns timestamptz
language sql
stable
as $$
  select (date_trunc('week', (now() at time zone 'utc')) at time zone 'utc');
$$;

create or replace function public.calculate_tier(p_rp integer)
returns text
language plpgsql
stable
as $$
declare
  floors jsonb;
  rival int;
  duel int;
  glad int;
  undis int;
begin
  select tier_floors into floors
  from public.seasons
  where status = 'active'
  order by starts_at desc
  limit 1;

  if floors is null then
    return 'challenger';
  end if;

  rival := coalesce((floors->>'rival')::int, 1200);
  duel := coalesce((floors->>'duelist')::int, 1800);
  glad := coalesce((floors->>'gladiator')::int, 2400);
  undis := coalesce((floors->>'undisputed')::int, 2800);

  if p_rp >= undis then
    return 'undisputed';
  elsif p_rp >= glad then
    return 'gladiator';
  elsif p_rp >= duel then
    return 'duelist';
  elsif p_rp >= rival then
    return 'rival';
  end if;
  return 'challenger';
end;
$$;

create or replace function public.tier_floor_rp(p_tier text)
returns integer
language plpgsql
stable
as $$
declare
  floors jsonb;
begin
  select tier_floors into floors
  from public.seasons
  where status = 'active'
  order by starts_at desc
  limit 1;

  if floors is null then
    return 0;
  end if;
  return coalesce((floors->>p_tier)::int, 0);
end;
$$;

-- Atomic balance + ledger (service role / definer)
create or replace function public.increment_currency(
  p_user_id uuid,
  p_currency_type text,
  p_amount integer,
  p_action_type text,
  p_reference_type text default null,
  p_reference_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_h int;
  v_c int;
  v_th int;
  v_tc int;
  v_new_h int;
  v_new_c int;
  v_bal int;
begin
  if p_currency_type not in ('honor', 'conquest') then
    raise exception 'invalid currency_type';
  end if;

  insert into public.user_currencies (user_id) values (p_user_id)
  on conflict (user_id) do nothing;

  select honor_points, conquest_points, total_honor_earned, total_conquest_earned
  into v_h, v_c, v_th, v_tc
  from public.user_currencies
  where user_id = p_user_id
  for update;

  if p_currency_type = 'honor' then
    if p_amount < 0 and v_h + p_amount < 0 then
      raise exception 'insufficient_honor';
    end if;
    v_new_h := greatest(0, v_h + p_amount);
    if p_amount > 0 then
      v_th := v_th + p_amount;
    end if;
    v_bal := v_new_h;
    update public.user_currencies
    set
      honor_points = v_new_h,
      total_honor_earned = v_th,
      updated_at = now()
    where user_id = p_user_id;
  else
    if p_amount < 0 and v_c + p_amount < 0 then
      raise exception 'insufficient_conquest';
    end if;
    v_new_c := greatest(0, v_c + p_amount);
    if p_amount > 0 then
      v_tc := v_tc + p_amount;
    end if;
    v_bal := v_new_c;
    update public.user_currencies
    set
      conquest_points = v_new_c,
      total_conquest_earned = v_tc,
      updated_at = now()
    where user_id = p_user_id;
  end if;

  insert into public.currency_ledger (
    user_id, currency_type, amount, balance_after, action_type, reference_type, reference_id, metadata
  ) values (
    p_user_id, p_currency_type, p_amount, v_bal, p_action_type, p_reference_type, p_reference_id, coalesce(p_metadata, '{}'::jsonb)
  );

  select honor_points, conquest_points into v_h, v_c from public.user_currencies where user_id = p_user_id;

  return jsonb_build_object(
    'honor_points', v_h,
    'conquest_points', v_c,
    'balance_after', v_bal
  );
end;
$$;

create or replace function public.apply_honor_decay(p_decay_rate numeric default 0.05)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_week timestamptz;
  n int := 0;
  rec record;
  v_loss int;
  v_new int;
begin
  v_week := public._utc_week_start_ts();

  for rec in
    select user_id, honor_points, last_honor_decay_at
    from public.user_currencies
    where honor_points > 0
  loop
    if rec.last_honor_decay_at is not null
       and to_char(rec.last_honor_decay_at at time zone 'UTC', 'IYYY-IW')
           = to_char(timezone('utc', now()), 'IYYY-IW')
    then
      continue;
    end if;

    v_loss := floor(rec.honor_points * p_decay_rate);
    if v_loss <= 0 then
      update public.user_currencies
      set last_honor_decay_at = now(), updated_at = now()
      where user_id = rec.user_id;
      continue;
    end if;

    v_new := greatest(0, rec.honor_points - v_loss);

    update public.user_currencies
    set
      honor_points = v_new,
      last_honor_decay_at = now(),
      updated_at = now()
    where user_id = rec.user_id;

    insert into public.currency_ledger (
      user_id, currency_type, amount, balance_after, action_type, reference_type, metadata
    ) values (
      rec.user_id, 'honor', -v_loss, v_new, 'weekly_decay', null, jsonb_build_object('decay_rate', p_decay_rate)
    );

    n := n + 1;
  end loop;

  return n;
end;
$$;

create or replace function public.apply_rp_decay()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  comp boolean;
  rp_rate numeric;
  rec record;
  v_new int;
  v_floor int;
  v_week date;
  n int := 0;
begin
  select competitive_mode, rp_decay_rate
  into comp, rp_rate
  from public.seasons
  where status = 'active'
  order by starts_at desc
  limit 1;

  if not found or comp is not true then
    return 0;
  end if;

  v_week := (public._utc_week_start_ts() at time zone 'utc')::date;

  for rec in select * from public.user_ratings
  loop
    if rec.rp_decay_week is not null and rec.rp_decay_week >= v_week then
      continue;
    end if;

    if rec.last_deal_at is not null and rec.last_deal_at >= (now() - interval '7 days') then
      continue;
    end if;

    if rec.decay_shield_until is not null and rec.decay_shield_until > now() then
      continue;
    end if;

    v_floor := public.tier_floor_rp(rec.current_tier);
    v_new := greatest(v_floor, floor(rec.current_rp * (1 - coalesce(rp_rate, 0.02))));

    if v_new <> rec.current_rp then
      insert into public.rating_history (user_id, rp_before, rp_after, reason, metadata)
      values (rec.user_id, rec.current_rp, v_new, 'weekly_rp_decay', '{}'::jsonb);
    end if;

    update public.user_ratings
    set
      current_rp = v_new,
      peak_rp_season = greatest(peak_rp_season, v_new),
      rp_decay_week = v_week,
      current_tier = public.calculate_tier(v_new),
      updated_at = now()
    where user_id = rec.user_id;

    n := n + 1;
  end loop;

  return n;
end;
$$;

create or replace function public.update_user_tier(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rp int;
  v_tier text;
  v_prev text;
begin
  select current_rp, current_tier into v_rp, v_prev from public.user_ratings where user_id = p_user_id;
  if v_rp is null then
    return;
  end if;

  v_tier := public.calculate_tier(v_rp);

  update public.user_ratings
  set
    current_tier = v_tier,
    tier_achieved_at = case
      when v_tier is distinct from v_prev then now()
      else tier_achieved_at
    end,
    updated_at = now()
  where user_id = p_user_id;
end;
$$;

create or replace function public.purchase_privilege(p_user_id uuid, p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  cat record;
  v_exp timestamptz;
begin
  select * into cat from public.privilege_catalog where slug = p_slug and is_active = true;
  if not found then
    raise exception 'privilege_not_found';
  end if;

  if cat.currency_type = 'both' then
    if cat.honor_cost > 0 then
      perform public.increment_currency(
        p_user_id, 'honor', -cat.honor_cost, 'privilege_purchase',
        'privilege_catalog', cat.id, jsonb_build_object('slug', p_slug)
      );
    end if;
    if cat.conquest_cost > 0 then
      perform public.increment_currency(
        p_user_id, 'conquest', -cat.conquest_cost, 'privilege_purchase',
        'privilege_catalog', cat.id, jsonb_build_object('slug', p_slug)
      );
    end if;
  elsif cat.currency_type = 'honor' then
    perform public.increment_currency(
      p_user_id, 'honor', -cat.honor_cost, 'privilege_purchase',
      'privilege_catalog', cat.id, jsonb_build_object('slug', p_slug)
    );
  elsif cat.currency_type = 'conquest' then
    perform public.increment_currency(
      p_user_id, 'conquest', -cat.conquest_cost, 'privilege_purchase',
      'privilege_catalog', cat.id, jsonb_build_object('slug', p_slug)
    );
  end if;

  v_exp := case
    when cat.duration_days is null then null
    else now() + (cat.duration_days || ' days')::interval
  end;

  insert into public.user_privileges (user_id, privilege_slug, expires_at, granted_by, metadata)
  values (p_user_id, p_slug, v_exp, 'purchase', '{}'::jsonb);

  return jsonb_build_object('ok', true, 'expires_at', v_exp);
end;
$$;

-- ─── RLS ───────────────────────────────────────────────────────────────────

alter table public.user_currencies enable row level security;
alter table public.currency_ledger enable row level security;
alter table public.user_ratings enable row level security;
alter table public.rating_history enable row level security;
alter table public.privilege_catalog enable row level security;
alter table public.user_privileges enable row level security;
alter table public.seasons enable row level security;

drop policy if exists user_currencies_select_public on public.user_currencies;
create policy user_currencies_select_public on public.user_currencies for select using (true);

drop policy if exists currency_ledger_select_public on public.currency_ledger;
create policy currency_ledger_select_public on public.currency_ledger for select using (true);

drop policy if exists user_ratings_select_public on public.user_ratings;
create policy user_ratings_select_public on public.user_ratings for select using (true);

drop policy if exists rating_history_select_public on public.rating_history;
create policy rating_history_select_public on public.rating_history for select using (true);

drop policy if exists privilege_catalog_select_public on public.privilege_catalog;
create policy privilege_catalog_select_public on public.privilege_catalog for select using (true);

drop policy if exists user_privileges_select_public on public.user_privileges;
create policy user_privileges_select_public on public.user_privileges for select using (true);

drop policy if exists seasons_select_public on public.seasons;
create policy seasons_select_public on public.seasons for select using (true);

-- ─── Seed season & catalog ─────────────────────────────────────────────────

insert into public.seasons (
  name, slug, starts_at, ends_at, competitive_starts_at,
  prize_pool_usd, payout_structure, tier_floors, decay_rate, rp_decay_rate,
  competitive_mode, status
) values (
  'Season 1',
  'season-1',
  timestamptz '2026-01-01 00:00:00+00',
  timestamptz '2026-03-29 23:59:59+00',
  timestamptz '2026-05-29 00:00:00+00',
  24500.00,
  '[8000,5000,3500,2500,1800,1200,900,700,500,400]'::jsonb,
  '{"challenger":0,"rival":1200,"duelist":1800,"gladiator":2400,"undisputed":2800}'::jsonb,
  0.05,
  0.02,
  false,
  'active'
)
on conflict (slug) do nothing;

insert into public.privilege_catalog (slug, name, description, currency_type, honor_cost, conquest_cost, category, duration_days, is_active)
values
  ('listing_boost_7d', 'Listing boost (7 days)', 'Boost listing to top of search for 7 days', 'honor', 500, 0, 'boost', 7, true),
  ('profile_highlight', 'Profile highlight', 'Highlighted profile border in search results', 'honor', 300, 0, 'badge', 30, true),
  ('deal_room_priority', 'Deal room priority', 'Chat replies prioritized in deal room feed', 'honor', 400, 0, 'feature', 7, true),
  ('extra_listing_slot', 'Extra listing slot', 'Unlock 1 additional listing slot', 'conquest', 0, 50, 'feature', null, true),
  ('reduced_fee_deal', 'Reduced fee next deal', '12% platform fee instead of 15% on next deal', 'conquest', 0, 100, 'feature', null, true),
  ('priority_placement', 'Priority placement', 'Profile appears in Featured on homepage', 'conquest', 0, 75, 'access', 7, true),
  ('early_feature_access', 'Early feature access', 'Beta access to unreleased features', 'conquest', 0, 200, 'access', 30, true),
  ('verified_dealer_badge', 'Verified Dealer badge', 'Verified Dealer badge visible on profile', 'conquest', 0, 150, 'badge', null, true)
on conflict (slug) do nothing;

-- ─── Backfill existing profiles ─────────────────────────────────────────────

insert into public.user_currencies (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

-- RP seed: completed projects (client or owner) × 25 only. Avoids profiles columns that
-- may be missing on older DBs (e.g. completed_projects_count, reputation).
insert into public.user_ratings (
  user_id,
  current_rp,
  peak_rp_season,
  current_tier,
  tier_achieved_at
)
select
  p.id,
  v.rp,
  v.rp,
  public.calculate_tier(v.rp),
  now()
from public.profiles p
cross join lateral (
  select
    least(
      10000,
      greatest(
        0,
        coalesce(
          (
            select count(*)::int
            from public.projects j
            where j.status = 'completed'
              and (j.client_id = p.id or j.owner_id = p.id)
          ),
          0
        ) * 25
      )
    )::int as rp
) v
on conflict (user_id) do nothing;

update public.user_ratings ur
set current_tier = public.calculate_tier(ur.current_rp),
    updated_at = now()
where true;

grant execute on function public.increment_currency(uuid, text, int, text, text, uuid, jsonb) to service_role;
grant execute on function public.apply_honor_decay(numeric) to service_role;
grant execute on function public.apply_rp_decay() to service_role;
grant execute on function public.update_user_tier(uuid) to service_role;
grant execute on function public.purchase_privilege(uuid, text) to service_role;
grant execute on function public.calculate_tier(integer) to anon, authenticated, service_role;
grant execute on function public.tier_floor_rp(text) to service_role;
