-- Subscription plan crypto checkout (NOWPayments). order_id prefix PL- (see platform-repository).

create table if not exists public.plan_payment_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tier_id text not null,
  billing_period text not null check (billing_period in ('monthly', 'yearly')),
  reference text not null unique,
  amount_usd numeric(12,2) not null,
  quote_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'cancelled')),
  paid_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  nowpayments_invoice_id text
);

create index if not exists plan_payment_intents_user_status_idx
  on public.plan_payment_intents (user_id, status);

create index if not exists plan_payment_intents_reference_idx
  on public.plan_payment_intents (reference);

create index if not exists plan_payment_intents_nowpayments_invoice_idx
  on public.plan_payment_intents (nowpayments_invoice_id)
  where nowpayments_invoice_id is not null;
