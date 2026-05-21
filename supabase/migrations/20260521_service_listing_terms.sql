-- Short-term listings (ending date) vs long-term subscriptions on service_packages

alter table public.service_packages
  add column if not exists listing_type text not null default 'short_term'
    check (listing_type in ('short_term', 'long_term'));

alter table public.service_packages
  add column if not exists ends_at timestamptz;

alter table public.service_packages
  add column if not exists billing_interval text
    check (billing_interval is null or billing_interval in ('weekly', 'monthly', 'quarterly', 'yearly'));

create index if not exists service_packages_listing_type_idx
  on public.service_packages (listing_type, status);

create index if not exists service_packages_ends_at_idx
  on public.service_packages (ends_at)
  where ends_at is not null;

comment on column public.service_packages.listing_type is 'short_term = one-off with optional ends_at; long_term = subscription';
comment on column public.service_packages.ends_at is 'When the short-term listing stops accepting orders';
comment on column public.service_packages.billing_interval is 'Subscription cadence for long_term listings';
