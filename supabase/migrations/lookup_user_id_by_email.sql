-- Resolve auth user id by email for server-side invite flows (profiles.id matches auth.users.id).
-- Exposed only to service_role PostgREST; anon/authenticated have no execute.

create or replace function public.lookup_user_id_by_email(search_email text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select u.id
  from auth.users u
  where search_email is not null
    and length(trim(search_email)) > 0
    and lower(trim(u.email)) = lower(trim(search_email))
  limit 1;
$$;

comment on function public.lookup_user_id_by_email(text) is
  'Invite helpers: map email to auth user id. Use service role only.';

revoke all on function public.lookup_user_id_by_email(text) from public;
grant execute on function public.lookup_user_id_by_email(text) to service_role;
