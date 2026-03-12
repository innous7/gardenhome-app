-- Community posts table
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('SHOW', 'QNA')),
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  images JSONB DEFAULT '[]',
  tags JSONB DEFAULT '[]',
  like_count INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Community comments
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Community likes (unique per user per post)
CREATE TABLE IF NOT EXISTS community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON community_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto update like_count
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_like_count
  AFTER INSERT OR DELETE ON community_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_like_count();

-- Auto update comment_count
CREATE OR REPLACE FUNCTION update_post_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_count
  AFTER INSERT OR DELETE ON community_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count();

-- RLS
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_likes ENABLE ROW LEVEL SECURITY;

-- Posts: anyone can read published posts
CREATE POLICY "Anyone can view published posts" ON community_posts
  FOR SELECT USING (is_published = true);

-- Posts: authenticated users can create
CREATE POLICY "Authenticated users can create posts" ON community_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- Posts: authors can update/delete own posts
CREATE POLICY "Authors can update own posts" ON community_posts
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts" ON community_posts
  FOR DELETE USING (auth.uid() = author_id);

-- Comments: anyone can read
CREATE POLICY "Anyone can view comments" ON community_comments
  FOR SELECT USING (true);

-- Comments: authenticated users can create
CREATE POLICY "Authenticated users can comment" ON community_comments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

-- Comments: authors can delete own
CREATE POLICY "Authors can delete own comments" ON community_comments
  FOR DELETE USING (auth.uid() = author_id);

-- Likes: anyone can read
CREATE POLICY "Anyone can view likes" ON community_likes
  FOR SELECT USING (true);

-- Likes: authenticated users can toggle
CREATE POLICY "Authenticated users can like" ON community_likes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike" ON community_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_community_posts_type ON community_posts(type, created_at DESC);
CREATE INDEX idx_community_posts_author ON community_posts(author_id);
CREATE INDEX idx_community_comments_post ON community_comments(post_id, created_at);
CREATE INDEX idx_community_likes_post ON community_likes(post_id);
