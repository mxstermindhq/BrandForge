-- Phase 4: ranked profile discovery (pg_trgm + skills array ILIKE).
-- Apply in Supabase SQL editor or `supabase db push` when ready.

create EXTENSION if not exists pg_trgm;

create or replace function public.search_profiles_trgm_ranked(p_q text, p_limit int)
returns table (
  id uuid,
  rank_score double precision
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id,
    greatest(
      similarity(lower(coalesce(p.username, '')), lower(trim(p_q))),
      similarity(lower(coalesce(p.full_name, '')), lower(trim(p_q))),
      similarity(lower(coalesce(p.headline, '')), lower(trim(p_q))),
      coalesce(
        (
          select max(similarity(lower(s), lower(trim(p_q))))
          from unnest(coalesce(p.skills, '{}'::text[])) as s
        ),
        0::double precision
      )
    )::double precision as rank_score
  from public.profiles p
  where char_length(trim(p_q)) >= 2
    and (
      p.username ilike '%' || p_q || '%'
      or p.full_name ilike '%' || p_q || '%'
      or p.headline ilike '%' || p_q || '%'
      or p.bio ilike '%' || p_q || '%'
      or exists (
        select 1
        from unnest(coalesce(p.skills, '{}'::text[])) s2
        where s2 ilike '%' || p_q || '%'
      )
    )
  order by rank_score desc, p.created_at desc
  limit least(coalesce(nullif(p_limit, 0), 20), 200);
$$;

grant execute on function public.search_profiles_trgm_ranked(text, int) to service_role;
