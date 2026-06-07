-- Run in Supabase SQL Editor if schema was applied before the search rebuild.

ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS persona_text TEXT;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS extracted_persona JSONB DEFAULT '{}'::jsonb;

ALTER TABLE leads ADD COLUMN IF NOT EXISTS score_reason TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS fit_tags JSONB DEFAULT '[]'::jsonb;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS likely_pain TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS best_contact_channel TEXT;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS location_guess TEXT;
