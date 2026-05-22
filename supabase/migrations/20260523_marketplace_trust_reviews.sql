-- Trust, reviews, order lifecycle, analytics (ship mode)

-- Extend order statuses
alter table public.marketplace_orders drop constraint if exists marketplace_orders_status_check;
alter table public.marketplace_orders
  add constraint marketplace_orders_status_check
  check (status in (
    'pending',
    'paid',
    'in_progress',
    'delivered',
    'revision_requested',
    'completed',
    'disputed',
    'cancelled',
    'expired'
  ));

alter table public.marketplace_orders
  add column if not exists delivery_note text,
  add column if not exists delivery_url text,
  add column if not exists delivered_at timestamptz,
  add column if not exists buyer_approved_at timestamptz;

-- Order timeline events
create table if not exists public.marketplace_order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  event_type text not null,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists marketplace_order_events_order_idx
  on public.marketplace_order_events (order_id, created_at asc);

-- Reviews tied to completed marketplace orders only
create table if not exists public.marketplace_order_reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade unique,
  listing_id uuid references public.service_packages(id) on delete set null,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  headline text not null check (char_length(trim(headline)) >= 3),
  body text not null check (char_length(trim(body)) >= 20),
  delivery_score smallint not null check (delivery_score >= 1 and delivery_score <= 5),
  communication_score smallint not null check (communication_score >= 1 and communication_score <= 5),
  value_score smallint not null check (value_score >= 1 and value_score <= 5),
  would_recommend boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists marketplace_order_reviews_reviewee_idx
  on public.marketplace_order_reviews (reviewee_id, created_at desc);

create index if not exists marketplace_order_reviews_listing_idx
  on public.marketplace_order_reviews (listing_id);

-- Funnel analytics (server-side)
create table if not exists public.platform_analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  path text,
  user_id uuid references public.profiles(id) on delete set null,
  session_id text,
  props jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists platform_analytics_events_event_idx
  on public.platform_analytics_events (event, created_at desc);

create index if not exists platform_analytics_events_created_idx
  on public.platform_analytics_events (created_at desc);

-- Profile links for completion scoring
alter table public.profiles
  add column if not exists social_links jsonb not null default '[]'::jsonb;

comment on column public.profiles.social_links is 'Array of {type, url} social links';

alter table public.marketplace_order_events enable row level security;
alter table public.marketplace_order_reviews enable row level security;
alter table public.platform_analytics_events enable row level security;

drop policy if exists marketplace_order_events_party on public.marketplace_order_events;
create policy marketplace_order_events_party on public.marketplace_order_events
  for select to authenticated
  using (
    exists (
      select 1 from public.marketplace_orders o
      where o.id = order_id
        and (o.buyer_id = auth.uid() or o.seller_id = auth.uid())
    )
  );

drop policy if exists marketplace_order_reviews_select_public on public.marketplace_order_reviews;
create policy marketplace_order_reviews_select_public on public.marketplace_order_reviews
  for select to anon, authenticated
  using (true);

drop policy if exists marketplace_order_reviews_insert_reviewer on public.marketplace_order_reviews;
create policy marketplace_order_reviews_insert_reviewer on public.marketplace_order_reviews
  for insert to authenticated
  with check (reviewer_id = auth.uid());

drop policy if exists platform_analytics_insert on public.platform_analytics_events;
create policy platform_analytics_insert on public.platform_analytics_events
  for insert to anon, authenticated
  with check (true);
