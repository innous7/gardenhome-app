-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('QUOTE_REQUEST', 'QUOTE_RECEIVED', 'CONTRACT_SIGNED', 'PROJECT_UPDATE', 'REVIEW', 'MESSAGE', 'SYSTEM')),
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow server to insert (service role)
CREATE POLICY "Service can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Index for fast queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
