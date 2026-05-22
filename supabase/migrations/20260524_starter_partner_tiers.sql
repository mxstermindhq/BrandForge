-- Starter (one-off $300–$1.5k) vs Partner (retainer or high-ticket $500–$15k)

alter table public.service_packages drop constraint if exists service_packages_listing_type_check;

update public.service_packages
set listing_type = case
  when listing_type = 'long_term' then 'partner'
  else 'starter'
end
where listing_type in ('short_term', 'long_term');

alter table public.service_packages
  alter column listing_type set default 'starter';

alter table public.service_packages
  add constraint service_packages_listing_type_check
  check (listing_type in ('starter', 'partner'));

comment on column public.service_packages.listing_type is 'starter = one-off ($300–$1.5k); partner = retainer or scale ($500–$15k)';
comment on column public.service_packages.ends_at is 'Optional close date for starter listings';
comment on column public.service_packages.billing_interval is 'Subscription cadence for partner retainers';
