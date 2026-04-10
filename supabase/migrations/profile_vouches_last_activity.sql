-- User-to-user vouches (one row per voucher → vouchee). profiles.vouches is kept in sync via app logic.
create table if not exists public.profile_vouches (
  voucher_id uuid not null references public.profiles(id) on delete cascade,
  vouchee_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (voucher_id, vouchee_id),
  constraint profile_vouches_no_self check (voucher_id <> vouchee_id)
);

create index if not exists profile_vouches_vouchee_idx
  on public.profile_vouches (vouchee_id, created_at desc);

-- Denormalized activity timestamp (updated on feed posts, vouches, etc.)
alter table public.profiles add column if not exists last_activity_at timestamptz;
