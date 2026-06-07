-- LeadForge Supabase schema (Postgres). Run in Supabase SQL Editor.
-- Auth is handled by Supabase Auth (auth.users). App data lives in public.* tables.

-- ── Profiles (1:1 with auth.users) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_purchased INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  credits_purchased INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'complete', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('b2b', 'b2c')),
  product_name TEXT NOT NULL,
  product_description TEXT,
  target_description TEXT NOT NULL,
  price_point TEXT NOT NULL,
  location TEXT,
  quantity_requested INTEGER NOT NULL,
  quantity_delivered INTEGER NOT NULL DEFAULT 0,
  platforms JSONB NOT NULL DEFAULT '[]'::jsonb,
  enrich BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'complete', 'failed', 'paused', 'cancelled')),
  credits_used INTEGER NOT NULL DEFAULT 0,
  cursor INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  persona_text TEXT,
  extracted_persona JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform_source TEXT NOT NULL,
  company_name TEXT,
  contact_name TEXT,
  email TEXT,
  email_confidence TEXT,
  email_source TEXT,
  company_domain TEXT,
  phone TEXT,
  website TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  reddit_username TEXT,
  tiktok_handle TEXT,
  twitter_handle TEXT,
  youtube_channel TEXT,
  location TEXT,
  niche TEXT,
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'contacted', 'qualified', 'rejected')),
  score INTEGER NOT NULL DEFAULT 0,
  fit_label TEXT,
  estimated_size TEXT,
  likely_needs TEXT,
  pitch_angle TEXT,
  score_reason TEXT,
  fit_tags JSONB DEFAULT '[]'::jsonb,
  likely_pain TEXT,
  best_contact_channel TEXT,
  location_guess TEXT,
  red_flags TEXT,
  raw_data TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row-based dedup cache (6h TTL via purge_expired_campaign_candidates).
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

-- Chunked processor JSON staging (legacy chunk resume).
CREATE TABLE IF NOT EXISTS public.campaign_staging_cache (
  campaign_id UUID PRIMARY KEY REFERENCES public.campaigns(id) ON DELETE CASCADE,
  candidates JSONB NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '6 hours')
);

CREATE INDEX IF NOT EXISTS idx_leads_campaign ON public.leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_user ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON public.leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_user ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe ON public.transactions(stripe_session_id);

-- Atomic credit deduction (returns true when balance was sufficient).
CREATE OR REPLACE FUNCTION public.deduct_credits(p_user_id UUID, p_amount INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rows_changed INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RETURN true;
  END IF;
  UPDATE credits
  SET balance = balance - p_amount, updated_at = now()
  WHERE user_id = p_user_id AND balance >= p_amount;
  GET DIAGNOSTICS rows_changed = ROW_COUNT;
  RETURN rows_changed > 0;
END;
$$;

-- Purge dedup rows older than 6 hours.
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
  DELETE FROM public.campaign_staging_cache WHERE expires_at < now();
  RETURN deleted_count;
END;
$$;

-- RLS: users see only their own rows; service role bypasses RLS for API routes.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_candidates ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY credits_select_own ON public.credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY transactions_select_own ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY campaigns_all_own ON public.campaigns FOR ALL USING (auth.uid() = user_id);
CREATE POLICY leads_all_own ON public.leads FOR ALL USING (auth.uid() = user_id);
