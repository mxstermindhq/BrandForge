-- Migration: row-based campaign_candidates dedup cache + staging table rename.
-- Run in Supabase SQL Editor on existing projects.

-- Move legacy JSON blob cache to staging table (if old shape exists).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'campaign_candidates'
      AND column_name = 'candidates'
  ) THEN
    CREATE TABLE IF NOT EXISTS public.campaign_staging_cache (
      campaign_id UUID PRIMARY KEY REFERENCES public.campaigns(id) ON DELETE CASCADE,
      candidates JSONB NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '6 hours')
    );
    INSERT INTO public.campaign_staging_cache (campaign_id, candidates, expires_at)
    SELECT campaign_id, candidates, expires_at
    FROM public.campaign_candidates
    ON CONFLICT (campaign_id) DO UPDATE
      SET candidates = EXCLUDED.candidates, expires_at = EXCLUDED.expires_at;
    DROP TABLE public.campaign_candidates;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.campaign_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  source_identifier TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, source_identifier)
);

CREATE INDEX IF NOT EXISTS idx_campaign_candidates_dedup
  ON public.campaign_candidates (campaign_id, source_identifier);

CREATE INDEX IF NOT EXISTS idx_campaign_candidates_created
  ON public.campaign_candidates (created_at);

CREATE TABLE IF NOT EXISTS public.campaign_staging_cache (
  campaign_id UUID PRIMARY KEY REFERENCES public.campaigns(id) ON DELETE CASCADE,
  candidates JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '6 hours')
);

-- Purge dedup rows older than 6 hours (call from app or pg_cron).
CREATE OR REPLACE FUNCTION public.purge_expired_campaign_candidates()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.campaign_candidates
  WHERE created_at < now() - interval '6 hours';
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  DELETE FROM public.campaign_staging_cache
  WHERE expires_at < now();

  RETURN deleted_count;
END;
$$;

ALTER TABLE public.campaign_candidates ENABLE ROW LEVEL SECURITY;
