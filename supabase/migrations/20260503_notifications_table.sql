-- Notifications table with proper relationships

-- Drop existing notifications table if it exists with wrong structure
DROP TABLE IF EXISTS notifications CASCADE;

-- Create notifications table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,  -- The user who receives the notification
  actor_id UUID,          -- The user who triggered the notification (nullable for system notifications)
  type TEXT NOT NULL CHECK (type IN (
    'DEAL_WON', 'DEAL_LOST', 'DEAL_MESSAGE', 
    'FOLLOW', 'ENDORSEMENT', 'REVIEW',
    'BRIEF_MATCH', 'SQUAD_INVITE', 'PAYMENT',
    'SYSTEM'
  )),
  title TEXT NOT NULL,
  message TEXT,
  data JSONB DEFAULT '{}',  -- Additional metadata
  read BOOLEAN DEFAULT false,
  link_url TEXT,            -- Optional link to navigate when clicked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark as read)" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON notifications FOR DELETE 
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, read, created_at DESC) WHERE read = false;
CREATE INDEX idx_notifications_actor_id ON notifications(actor_id);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON notifications;
CREATE TRIGGER update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
