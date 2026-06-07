-- Email metadata columns for leads (run in Supabase SQL Editor if not present)
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email_confidence TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS email_source TEXT;
ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS company_domain TEXT;
