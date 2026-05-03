-- Fix all schema issues - profiles columns + social tables + storage bucket

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO PROFILES TABLE
-- ============================================================================

DO $$
BEGIN
  -- Add open_to_offers column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'open_to_offers') THEN
    ALTER TABLE profiles ADD COLUMN open_to_offers BOOLEAN DEFAULT false;
  END IF;

  -- Add preferred_offer_types column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'preferred_offer_types') THEN
    ALTER TABLE profiles ADD COLUMN preferred_offer_types TEXT[] DEFAULT '{}';
  END IF;

  -- Add min_budget column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'min_budget') THEN
    ALTER TABLE profiles ADD COLUMN min_budget INTEGER;
  END IF;

  -- Add preferred_duration column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'preferred_duration') THEN
    ALTER TABLE profiles ADD COLUMN preferred_duration TEXT;
  END IF;

  -- Add remote_only column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'remote_only') THEN
    ALTER TABLE profiles ADD COLUMN remote_only BOOLEAN DEFAULT false;
  END IF;

  -- Add willing_to_relocate column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'willing_to_relocate') THEN
    ALTER TABLE profiles ADD COLUMN willing_to_relocate BOOLEAN DEFAULT false;
  END IF;

  -- Add notice_period column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'notice_period') THEN
    ALTER TABLE profiles ADD COLUMN notice_period TEXT;
  END IF;

  -- Add desired_roles column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'desired_roles') THEN
    ALTER TABLE profiles ADD COLUMN desired_roles TEXT[] DEFAULT '{}';
  END IF;

  -- Add portfolio column for external links
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'portfolio') THEN
    ALTER TABLE profiles ADD COLUMN portfolio JSONB DEFAULT '[]';
  END IF;

END $$;

-- ============================================================================
-- 2. CREATE SOCIAL FEATURES TABLES
-- ============================================================================

-- feed_items
CREATE TABLE IF NOT EXISTS feed_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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

-- follows
CREATE TABLE IF NOT EXISTS follows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- saved_specialists
CREATE TABLE IF NOT EXISTS saved_specialists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  specialist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, specialist_id)
);

-- skill_endorsements
CREATE TABLE IF NOT EXISTS skill_endorsements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  endorsed_by_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  verified BOOLEAN DEFAULT true,
  deal_context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, endorsed_by_id, skill)
);

-- notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime for notifications
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- ============================================================================
-- 3. INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS feed_items_user_idx ON feed_items(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS feed_items_visibility_idx ON feed_items(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS follows_follower_idx ON follows(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS follows_following_idx ON follows(following_id, created_at DESC);
CREATE INDEX IF NOT EXISTS saved_specialists_user_idx ON saved_specialists(user_id, specialist_id);
CREATE INDEX IF NOT EXISTS skill_endorsements_profile_idx ON skill_endorsements(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications(user_id, is_read, created_at DESC);

-- ============================================================================
-- 4. RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Feed items policies
CREATE POLICY "Feed items are viewable by everyone" ON feed_items
  FOR SELECT USING (visibility = 'public');

CREATE POLICY "Users can create their own feed items" ON feed_items
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Follows policies
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can manage their own follows" ON follows
  FOR ALL USING (follower_id = auth.uid());

-- Saved specialists policies
CREATE POLICY "Users can view their saved specialists" ON saved_specialists
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can save specialists" ON saved_specialists
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can unsave specialists" ON saved_specialists
  FOR DELETE USING (user_id = auth.uid());

-- Skill endorsements policies
CREATE POLICY "Skill endorsements are viewable by everyone" ON skill_endorsements FOR SELECT USING (true);
CREATE POLICY "Users can create endorsements" ON skill_endorsements
  FOR INSERT WITH CHECK (endorsed_by_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 5. STORAGE BUCKET FOR PORTFOLIO
-- ============================================================================

-- Create media bucket if not exists
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('media', 'media', true, 52428800, 
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Media bucket public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload to media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- ============================================================================
-- 6. FUNCTIONS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feed_items_updated_at ON feed_items;
CREATE TRIGGER update_feed_items_updated_at
  BEFORE UPDATE ON feed_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
