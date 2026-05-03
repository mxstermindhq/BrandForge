-- Part 2: Create social feature tables (SIMPLIFIED VERSION)
-- Run this in Supabase SQL Editor AFTER running part 1

-- ============================================================================
-- 1. FEED ITEMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS feed_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'DEAL_CLOSED','BRIEF_POSTED','LEVEL_UP',
    'OPEN_FOR_WORK','COLLAB_WANTED','PORTFOLIO_POST',
    'TESTIMONIAL','SAVED','ENDORSED','FOLLOWED'
  )),
  content TEXT,
  data JSONB DEFAULT '{}',
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public','followers','private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. FOLLOWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- ============================================================================
-- 3. SAVED SPECIALISTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS saved_specialists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  specialist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, specialist_id)
);

-- ============================================================================
-- 4. SKILL ENDORSEMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS skill_endorsements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  endorsed_by_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, endorsed_by_id, skill)
);

-- ============================================================================
-- 5. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for notifications
ALTER TABLE IF EXISTS notifications REPLICA IDENTITY FULL;

-- ============================================================================
-- 6. INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS feed_items_user_idx ON feed_items(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS feed_items_visibility_idx ON feed_items(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS follows_follower_idx ON follows(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS follows_following_idx ON follows(following_id, created_at DESC);
CREATE INDEX IF NOT EXISTS saved_specialists_user_idx ON saved_specialists(user_id, specialist_id);
CREATE INDEX IF NOT EXISTS skill_endorsements_profile_idx ON skill_endorsements(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, is_read, created_at DESC);

-- ============================================================================
-- 7. ENABLE RLS (without policies yet - add them separately)
-- ============================================================================
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feed_items_updated_at ON feed_items;
CREATE TRIGGER update_feed_items_updated_at
  BEFORE UPDATE ON feed_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
