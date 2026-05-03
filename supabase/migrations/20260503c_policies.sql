-- Part 3: Add RLS Policies and Storage (run AFTER tables are created)

-- ============================================================================
-- 1. RLS POLICIES FOR FEED ITEMS
-- ============================================================================
DROP POLICY IF EXISTS "Feed items are viewable by everyone" ON feed_items;
CREATE POLICY "Feed items are viewable by everyone" ON feed_items
  FOR SELECT USING (visibility = 'public');

DROP POLICY IF EXISTS "Users can create their own feed items" ON feed_items;
CREATE POLICY "Users can create their own feed items" ON feed_items
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 2. RLS POLICIES FOR FOLLOWS
-- ============================================================================
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON follows;
CREATE POLICY "Follows are viewable by everyone" ON follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage their own follows" ON follows;
CREATE POLICY "Users can manage their own follows" ON follows
  FOR ALL USING (follower_id = auth.uid());

-- ============================================================================
-- 3. RLS POLICIES FOR SAVED SPECIALISTS (uses client_id not user_id)
-- ============================================================================
DROP POLICY IF EXISTS "Users can view their saved specialists" ON saved_specialists;
CREATE POLICY "Users can view their saved specialists" ON saved_specialists
  FOR SELECT USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Users can save specialists" ON saved_specialists;
CREATE POLICY "Users can save specialists" ON saved_specialists
  FOR INSERT WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Users can unsave specialists" ON saved_specialists;
CREATE POLICY "Users can unsave specialists" ON saved_specialists
  FOR DELETE USING (client_id = auth.uid());

-- ============================================================================
-- 4. RLS POLICIES FOR SKILL ENDORSEMENTS (uses endorsed_by not endorsed_by_id)
-- ============================================================================
DROP POLICY IF EXISTS "Skill endorsements are viewable by everyone" ON skill_endorsements;
CREATE POLICY "Skill endorsements are viewable by everyone" ON skill_endorsements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create endorsements" ON skill_endorsements;
CREATE POLICY "Users can create endorsements" ON skill_endorsements
  FOR INSERT WITH CHECK (endorsed_by = auth.uid());

-- ============================================================================
-- 5. RLS POLICIES FOR NOTIFICATIONS
-- ============================================================================
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
-- 6. STORAGE BUCKET FOR MEDIA
-- ============================================================================
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
CREATE POLICY "Public can view media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
CREATE POLICY "Authenticated users can upload media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Users can delete own media" ON storage.objects;
CREATE POLICY "Users can delete own media" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND owner = auth.uid());
