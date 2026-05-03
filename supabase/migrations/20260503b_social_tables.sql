-- Part 2: Create social feature tables (run this AFTER part 1 succeeds)
-- These tables reference profiles(id) which must exist

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
  data JSONB DEFAULT '{}'::JSONB,
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
  data JSONB DEFAULT '{}'::JSONB,
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
-- 7. RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Feed items policies
DROP POLICY IF EXISTS "Feed items are viewable by everyone" ON feed_items;
CREATE POLICY "Feed items are viewable by everyone" ON feed_items
  FOR SELECT USING (visibility = 'public');

DROP POLICY IF EXISTS "Users can create their own feed items" ON feed_items;
CREATE POLICY "Users can create their own feed items" ON feed_items
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Follows policies
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own follows" ON follows;
CREATE POLICY "Users can manage their own follows" ON follows
  FOR ALL USING (follower_id = auth.uid());

-- Saved specialists policies
DROP POLICY IF EXISTS "Users can view their saved specialists" ON saved_specialists;
CREATE POLICY "Users can view their saved specialists" ON saved_specialists
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can save specialists" ON saved_specialists;
CREATE POLICY "Users can save specialists" ON saved_specialists
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can unsave specialists" ON saved_specialists;
CREATE POLICY "Users can unsave specialists" ON saved_specialists
  FOR DELETE USING (user_id = auth.uid());

-- Skill endorsements policies
DROP POLICY IF EXISTS "Skill endorsements are viewable by everyone" ON skill_endorsements;
CREATE POLICY "Skill endorsements are viewable by everyone" ON skill_endorsements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create endorsements" ON skill_endorsements;
CREATE POLICY "Users can create endorsements" ON skill_endorsements
  FOR INSERT WITH CHECK (endorsed_by_id = auth.uid());

-- Notifications policies
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 8. STORAGE BUCKET
-- ============================================================================
-- Create storage bucket for portfolio media
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
CREATE POLICY "Public can view media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'media' 
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;
CREATE POLICY "Users can delete own media" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'media' 
    AND owner = auth.uid()
  );

-- ============================================================================
-- 9. TRIGGERS
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
