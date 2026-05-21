-- Marketplace productization: orders, crypto checkout, seller whitelist, analytics, listing intelligence

-- Roles: buyer (default browse/buy), seller (can list if whitelisted), admin, moderator
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check
  check (role in ('buyer', 'seller', 'member', 'affiliate', 'moderator', 'admin', 'enterprise'));

comment on column public.profiles.role is 'buyer=default purchaser; seller=listing creator (requires whitelist); member=legacy';

-- Seller email whitelist (admin-managed)
create table if not exists public.seller_whitelist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  email_normalized text not null unique,
  note text,
  added_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists seller_whitelist_email_idx on public.seller_whitelist (email_normalized);

-- Listing intelligence + trust (structured decision layer)
alter table public.service_packages
  add column if not exists intelligence jsonb not null default '{}'::jsonb;

comment on column public.service_packages.intelligence is 'domain, impact_scale, execution_speed, complexity_score, roi_potential, trust_level, delivery_format';

-- Marketplace orders (buyer purchases)
create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  listing_id uuid references public.service_packages(id) on delete set null,
  listing_slug text,
  listing_title text not null,
  amount_usd numeric(12,2) not null check (amount_usd > 0),
  status text not null default 'pending' check (status in (
    'pending',
    'paid',
    'in_progress',
    'delivered',
    'completed',
    'cancelled',
    'expired'
  )),
  payment_reference text unique,
  metadata jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_orders_buyer_idx on public.marketplace_orders (buyer_id, created_at desc);
create index if not exists marketplace_orders_seller_idx on public.marketplace_orders (seller_id, created_at desc);
create index if not exists marketplace_orders_listing_idx on public.marketplace_orders (listing_id);
create index if not exists marketplace_orders_status_idx on public.marketplace_orders (status);

-- Crypto payment intents for marketplace orders
create table if not exists public.marketplace_payment_intents (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  payer_id uuid not null references public.profiles(id) on delete cascade,
  reference text not null unique,
  amount_usd numeric(12,2) not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'cancelled')),
  nowpayments_invoice_id text,
  checkout_url text,
  provider_payload jsonb not null default '{}'::jsonb,
  paid_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists marketplace_payment_intents_order_idx on public.marketplace_payment_intents (order_id);
create index if not exists marketplace_payment_intents_ref_idx on public.marketplace_payment_intents (reference);

-- Saved listings (buyer)
create table if not exists public.saved_listings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id text not null,
  listing_type text not null default 'db' check (listing_type in ('db', 'official')),
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id, listing_type)
);

-- Listing view events (analytics)
create table if not exists public.listing_views (
  id uuid primary key default gen_random_uuid(),
  listing_id text not null,
  listing_type text not null default 'db',
  viewer_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists listing_views_listing_idx on public.listing_views (listing_id, created_at desc);

-- RLS
alter table public.marketplace_orders enable row level security;
alter table public.marketplace_payment_intents enable row level security;
alter table public.seller_whitelist enable row level security;
alter table public.saved_listings enable row level security;
alter table public.listing_views enable row level security;

drop policy if exists marketplace_orders_select_party on public.marketplace_orders;
create policy marketplace_orders_select_party on public.marketplace_orders
  for select to authenticated
  using (buyer_id = auth.uid() or seller_id = auth.uid());

drop policy if exists marketplace_orders_insert_buyer on public.marketplace_orders;
create policy marketplace_orders_insert_buyer on public.marketplace_orders
  for insert to authenticated
  with check (buyer_id = auth.uid());

drop policy if exists saved_listings_own on public.saved_listings;
create policy saved_listings_own on public.saved_listings
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists seller_whitelist_admin on public.seller_whitelist;
create policy seller_whitelist_admin on public.seller_whitelist
  for select to authenticated
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'moderator'))
  );

-- Public read published listings (anon + authenticated)
alter table public.service_packages enable row level security;

drop policy if exists service_packages_select_published on public.service_packages;
create policy service_packages_select_published on public.service_packages
  for select to anon, authenticated
  using (status = 'published');

drop policy if exists service_packages_mutate_owner on public.service_packages;
create policy service_packages_mutate_owner on public.service_packages
  for all to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());
