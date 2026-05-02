-- Social Features Migration
-- Creates tables for feed, follows, saved specialists, skill endorsements, squads, and referrals

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
  client_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  specialist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(client_id, specialist_id)
);

-- skill_endorsements
CREATE TABLE IF NOT EXISTS skill_endorsements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  specialist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  endorsed_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  verified BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(specialist_id, endorsed_by, skill)
);

-- squads
CREATE TABLE IF NOT EXISTS squads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  category_tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'active' 
    CHECK (status IN ('active','inactive','disbanded')),
  deals_closed INT DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- squad_members
CREATE TABLE IF NOT EXISTS squad_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  squad_id UUID REFERENCES squads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' 
    CHECK (role IN ('lead','member')),
  revenue_share INT NOT NULL 
    CHECK (revenue_share > 0 AND revenue_share <= 100),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(squad_id, user_id)
);

-- referral_stats
CREATE TABLE IF NOT EXISTS referral_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS saved_specialists_specialist_idx ON saved_specialists(specialist_id, created_at DESC);

CREATE INDEX IF NOT EXISTS skill_endorsements_specialist_idx ON skill_endorsements(specialist_id, created_at DESC);
CREATE INDEX IF NOT EXISTS skill_endorsements_endorsed_by_idx ON skill_endorsements(endorsed_by, created_at DESC);
CREATE INDEX IF NOT EXISTS skill_endorsements_skill_idx ON skill_endorsements(skill, created_at DESC);

CREATE INDEX IF NOT EXISTS squads_created_by_idx ON squads(created_by, created_at DESC);
CREATE INDEX IF NOT EXISTS squads_status_idx ON squads(status, created_at DESC);

CREATE INDEX IF NOT EXISTS squad_members_squad_idx ON squad_members(squad_id, joined_at DESC);
CREATE INDEX IF NOT EXISTS squad_members_user_idx ON squad_members(user_id, joined_at DESC);

CREATE INDEX IF NOT EXISTS referral_stats_referrer_idx ON referral_stats(referrer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS referral_stats_status_idx ON referral_stats(status, created_at DESC);

-- RLS policies (enable for all tables)
ALTER TABLE feed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_specialists ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_stats ENABLE ROW LEVEL SECURITY;

-- feed_items: public can read public items
CREATE POLICY "Public feed items visible to all"
  ON feed_items FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users manage own feed items"
  ON feed_items FOR ALL
  USING (auth.uid() = user_id);

-- follows: authenticated can follow
CREATE POLICY "Authenticated users can follow"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Anyone can see follow counts"
  ON follows FOR SELECT USING (true);

-- saved_specialists: private to client
CREATE POLICY "Client manages own saved list"
  ON saved_specialists FOR ALL
  USING (auth.uid() = client_id);

-- skill_endorsements: public read
CREATE POLICY "Endorsements public"
  ON skill_endorsements FOR SELECT USING (true);

CREATE POLICY "Only deal clients can endorse"
  ON skill_endorsements FOR INSERT
  WITH CHECK (auth.uid() = endorsed_by);

-- squads: public read
CREATE POLICY "Squads public"
  ON squads FOR SELECT USING (true);

CREATE POLICY "Squad lead manages squad"
  ON squads FOR ALL
  USING (auth.uid() = created_by);

-- squad_members: public read
CREATE POLICY "Squad members public"
  ON squad_members FOR SELECT USING (true);

-- referral_stats: private
CREATE POLICY "Referrer sees own stats"
  ON referral_stats FOR SELECT
  USING (auth.uid() = referrer_id);

-- Enable realtime for feed_items and notifications
-- Run in Supabase Dashboard: alter publication supabase_realtime add table public.feed_items;
