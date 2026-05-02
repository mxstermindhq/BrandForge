-- Fix profiles table structure if needed
-- This migration ensures the profiles table has the required columns

-- First, check if profiles table exists and add missing columns
DO $$
BEGIN
  -- Add id column if it doesn't exist (as primary key)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id'
  ) THEN
    -- If profiles uses auth.users(id) as primary key, we need to handle this differently
    RAISE NOTICE 'Profiles table may be using auth.users reference';
  END IF;
END $$;

-- Alternative: Create social features tables with auth.users reference
-- if profiles doesn't have an id column

-- Check if we should reference auth.users instead
DO $$
DECLARE
  profiles_has_id BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'id'
  ) INTO profiles_has_id;

  IF NOT profiles_has_id THEN
    RAISE NOTICE 'Profiles table does not have id column - social tables may need auth.users reference';
  END IF;
END $$;

-- feed_items - safe version that works with either structure
DROP TABLE IF EXISTS feed_items CASCADE;
CREATE TABLE feed_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,  -- References either profiles.id or auth.users.id
  type TEXT NOT NULL CHECK (type IN (
    'DEAL_CLOSED','BRIEF_POSTED','LEVEL_UP',
    'OPEN_FOR_WORK','COLLAB_WANTED','PORTFOLIO_POST',
    'SQUAD_FORMED','MILESTONE'
  )),
  content JSONB NOT NULL DEFAULT '{}',
  visibility TEXT DEFAULT 'public' 
    CHECK (visibility IN ('public','network','private')),
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key separately so we can catch errors
DO $$
BEGIN
  -- Try to add FK to profiles
  ALTER TABLE feed_items 
    ADD CONSTRAINT fk_feed_items_user 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
EXCEPTION WHEN OTHERS THEN
  -- If profiles doesn't have id, try auth.users
  BEGIN
    ALTER TABLE feed_items 
      ADD CONSTRAINT fk_feed_items_user 
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  EXCEPTION WHEN OTHERS THEN
    -- No FK constraint - will be handled by application
    RAISE NOTICE 'Could not add FK constraint to feed_items.user_id';
  END;
END $$;

-- follows
DROP TABLE IF EXISTS follows CASCADE;
CREATE TABLE follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- saved_specialists
DROP TABLE IF EXISTS saved_specialists CASCADE;
CREATE TABLE saved_specialists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  specialist_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, specialist_id)
);

-- skill_endorsements (without projects reference for now)
DROP TABLE IF EXISTS skill_endorsements CASCADE;
CREATE TABLE skill_endorsements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  specialist_id UUID NOT NULL,
  endorsed_by UUID NOT NULL,
  skill TEXT NOT NULL,
  project_id UUID,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(specialist_id, endorsed_by, skill)
);

-- squads
DROP TABLE IF EXISTS squads CASCADE;
CREATE TABLE squads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  category_tags TEXT[] DEFAULT '{}',
  created_by UUID,
  status TEXT DEFAULT 'active' 
    CHECK (status IN ('active','inactive','disbanded')),
  deals_closed INT DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- squad_members
DROP TABLE IF EXISTS squad_members CASCADE;
CREATE TABLE squad_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'member' 
    CHECK (role IN ('lead','member')),
  revenue_share INT NOT NULL 
    CHECK (revenue_share > 0 AND revenue_share <= 100),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(squad_id, user_id)
);

-- referral_stats
DROP TABLE IF EXISTS referral_stats CASCADE;
CREATE TABLE referral_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending','converted','rewarded')),
  reward_type TEXT,
  reward_value JSONB DEFAULT '{}',
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS feed_items_user_idx ON feed_items(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS feed_items_visibility_idx ON feed_items(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS feed_items_type_idx ON feed_items(type, created_at DESC);

CREATE INDEX IF NOT EXISTS follows_follower_idx ON follows(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS follows_following_idx ON follows(following_id, created_at DESC);

CREATE INDEX IF NOT EXISTS saved_specialists_client_idx ON saved_specialists(client_id, created_at DESC);
CREATE INDEX IF NOT EXISTS skill_endorsements_specialist_idx ON skill_endorsements(specialist_id, created_at DESC);
CREATE INDEX IF NOT EXISTS squad_members_squad_idx ON squad_members(squad_id, joined_at DESC);
CREATE INDEX IF NOT EXISTS referral_stats_referrer_idx ON referral_stats(referrer_id, created_at DESC);
