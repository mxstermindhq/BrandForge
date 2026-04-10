-- Unify account roles: default accounts are `member` (replaces client/specialist).
-- Add `moderator` for staff tooling (e.g. KYC review) alongside `admin`.
-- Paid / partner: `enterprise`, `affiliate` unchanged.

alter table public.profiles drop constraint if exists profiles_role_check;

update public.profiles
set role = 'member'
where role in ('client', 'specialist');

alter table public.profiles
  add constraint profiles_role_check
  check (role in ('member', 'affiliate', 'moderator', 'admin', 'enterprise'));
