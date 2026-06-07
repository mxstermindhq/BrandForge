-- Admin telemetry: structured logs + model/API usage (service-role access only).
-- Run in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
  source TEXT NOT NULL,
  message TEXT NOT NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_created ON public.admin_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_level ON public.admin_logs (level);
CREATE INDEX IF NOT EXISTS idx_admin_logs_source ON public.admin_logs (source);

CREATE TABLE IF NOT EXISTS public.model_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT '',
  operation TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  duration_ms INTEGER NOT NULL DEFAULT 0,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_model_usage_created ON public.model_usage (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_model_usage_provider ON public.model_usage (provider, model, operation);

ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_usage ENABLE ROW LEVEL SECURITY;
-- No policies: only service-role API routes read/write these tables.
