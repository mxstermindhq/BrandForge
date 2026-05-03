-- Fix existing social tables - Add missing columns and policies
-- Run this if tables already exist but need columns/policies

-- ============================================================================
-- 1. ADD MISSING COLUMNS TO EXISTING TABLES
-- ============================================================================

-- Check and add columns to feed_items
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feed_items' AND column_name = 'visibility') THEN
    ALTER TABLE feed_items ADD COLUMN visibility TEXT DEFAULT 'public';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'feed_items' AND column_name = 'updated_at') THEN
    ALTER TABLE feed_items ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Check and add columns to notifications
DO $$
BEGIN
  -- Note: notifications table uses 'read' not 'is_read', 'message' not 'content'

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'updated_at') THEN
    ALTER TABLE notifications ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'link_url') THEN
    ALTER TABLE notifications ADD COLUMN link_url TEXT;
  END IF;
END $$;

-- ============================================================================
-- 2. ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. CREATE POLICIES (with DROP IF EXISTS to avoid errors)
-- ============================================================================

-- Feed items policies
DROP POLICY IF EXISTS "Feed items are viewable by everyone" ON feed_items;
CREATE POLICY "Feed items are viewable by everyone" ON feed_items
  FOR SELECT USING (visibility = 'public' OR visibility IS NULL);

DROP POLICY IF EXISTS "Users can create their own feed items" ON feed_items;
CREATE POLICY "Users can create their own feed items" ON feed_items
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Follows policies (uses follower_id, not user_id!)
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own follows" ON follows;
CREATE POLICY "Users can manage their own follows" ON follows
  FOR ALL USING (follower_id = auth.uid());

-- Saved specialists policies (uses client_id not user_id)
DROP POLICY IF EXISTS "Users can view their saved specialists" ON saved_specialists;
CREATE POLICY "Users can view their saved specialists" ON saved_specialists
  FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Users can save specialists" ON saved_specialists;
CREATE POLICY "Users can save specialists" ON saved_specialists
  FOR INSERT WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Users can unsave specialists" ON saved_specialists;
CREATE POLICY "Users can unsave specialists" ON saved_specialists
  FOR DELETE USING (client_id = auth.uid());

-- Skill endorsements policies (uses specialist_id and endorsed_by)
DROP POLICY IF EXISTS "Skill endorsements are viewable by everyone" ON skill_endorsements;
CREATE POLICY "Skill endorsements are viewable by everyone" ON skill_endorsements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create endorsements" ON skill_endorsements;
CREATE POLICY "Users can create endorsements" ON skill_endorsements
  FOR INSERT WITH CHECK (endorsed_by = auth.uid());

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
-- 4. CREATE INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS feed_items_user_idx ON feed_items(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS feed_items_visibility_idx ON feed_items(visibility, created_at DESC);
CREATE INDEX IF NOT EXISTS follows_follower_idx ON follows(follower_id, created_at DESC);
CREATE INDEX IF NOT EXISTS follows_following_idx ON follows(following_id, created_at DESC);
CREATE INDEX IF NOT EXISTS saved_specialists_client_idx ON saved_specialists(client_id, specialist_id);
CREATE INDEX IF NOT EXISTS skill_endorsements_specialist_idx ON skill_endorsements(specialist_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_read_idx ON notifications(user_id, read, created_at DESC);

-- ============================================================================
-- 5. ENABLE REALTIME FOR NOTIFICATIONS
-- ============================================================================
ALTER TABLE IF EXISTS notifications REPLICA IDENTITY FULL;

-- ============================================================================
-- 6. CREATE TRIGGERS
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
