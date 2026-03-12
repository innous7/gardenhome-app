-- Scraps (찜하기) table
CREATE TABLE IF NOT EXISTS scraps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, portfolio_id)
);

-- RLS
ALTER TABLE scraps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scraps" ON scraps
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scraps" ON scraps
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own scraps" ON scraps
  FOR DELETE USING (auth.uid() = user_id);

-- Index
CREATE INDEX idx_scraps_user_id ON scraps(user_id);
