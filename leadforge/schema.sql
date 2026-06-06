-- LeadForge D1 schema (SQLite). Idempotent: safe to re-run.

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_admin INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS credits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_purchased INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  amount_cents INTEGER NOT NULL,
  credits_purchased INTEGER NOT NULL,
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('b2b','b2c')),
  product_name TEXT NOT NULL,
  product_description TEXT,
  target_description TEXT NOT NULL,
  price_point TEXT NOT NULL,
  location TEXT,
  quantity_requested INTEGER NOT NULL,
  quantity_delivered INTEGER DEFAULT 0,
  platforms TEXT NOT NULL,
  enrich INTEGER DEFAULT 1,
  status TEXT DEFAULT 'queued'
    CHECK(status IN ('queued','running','complete','failed','paused','cancelled')),
  credits_used INTEGER DEFAULT 0,
  -- continuation cursor for chunked queue processing (offset into the candidate set)
  cursor INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  completed_at TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  campaign_id TEXT NOT NULL REFERENCES campaigns(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  platform_source TEXT NOT NULL,
  company_name TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  linkedin_url TEXT,
  instagram_url TEXT,
  reddit_username TEXT,
  tiktok_handle TEXT,
  twitter_handle TEXT,
  youtube_channel TEXT,
  location TEXT,
  niche TEXT,
  status TEXT DEFAULT 'new'
    CHECK(status IN ('new','contacted','qualified','rejected')),
  score INTEGER DEFAULT 0,
  fit_label TEXT,
  estimated_size TEXT,
  likely_needs TEXT,
  pitch_angle TEXT,
  red_flags TEXT,
  raw_data TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_campaign ON leads(campaign_id);
CREATE INDEX IF NOT EXISTS idx_leads_user ON leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_campaigns_user ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_stripe ON transactions(stripe_session_id);
