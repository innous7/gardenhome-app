-- GardenHome Database Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'COMPANY', 'ADMIN');
CREATE TYPE project_type AS ENUM ('GARDEN', 'ROOFTOP', 'VERANDA', 'COMMERCIAL', 'OTHER');
CREATE TYPE garden_style AS ENUM ('MODERN', 'TRADITIONAL', 'NATURAL', 'MINIMAL', 'ENGLISH', 'JAPANESE', 'MIXED');
CREATE TYPE quote_request_status AS ENUM ('PENDING', 'MATCHED', 'COMPLETED', 'CANCELLED');
CREATE TYPE quote_status AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED');
CREATE TYPE contract_status AS ENUM ('DRAFT', 'REVIEW', 'PENDING_SIGN', 'SIGNED', 'COMPLETED', 'CANCELLED');
CREATE TYPE blog_category AS ENUM ('TREND', 'PLANT_GUIDE', 'TIPS', 'SEASONAL', 'COST_GUIDE', 'CASE_STUDY', 'NEWS');
CREATE TYPE flotren_plan AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAUSED', 'CANCELLED');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID');

-- ============================================
-- HELPER: updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PROFILES (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- COMPANIES (조경회사)
-- ============================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  business_number TEXT NOT NULL,
  representative TEXT NOT NULL,
  description TEXT DEFAULT '',
  logo_url TEXT,
  cover_image_url TEXT,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  specialties JSONB NOT NULL DEFAULT '[]',
  service_areas JSONB NOT NULL DEFAULT '[]',
  established TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  rating NUMERIC(2,1) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  project_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_companies_user_id ON companies(user_id);
CREATE INDEX idx_companies_is_approved ON companies(is_approved);
CREATE INDEX idx_companies_rating ON companies(rating DESC);

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- PORTFOLIOS (블로그형 포트폴리오)
-- ============================================
CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  cover_image_url TEXT,
  before_images JSONB NOT NULL DEFAULT '[]',
  after_images JSONB NOT NULL DEFAULT '[]',
  process_images JSONB NOT NULL DEFAULT '[]',
  project_type project_type NOT NULL,
  style garden_style NOT NULL,
  area NUMERIC(10,2),
  duration TEXT,
  location TEXT,
  budget TEXT,
  plants JSONB NOT NULL DEFAULT '[]',
  materials JSONB NOT NULL DEFAULT '[]',
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_portfolios_company_id ON portfolios(company_id);
CREATE INDEX idx_portfolios_project_type ON portfolios(project_type);
CREATE INDEX idx_portfolios_style ON portfolios(style);
CREATE INDEX idx_portfolios_is_published ON portfolios(is_published);
CREATE INDEX idx_portfolios_created_at ON portfolios(created_at DESC);

CREATE TRIGGER portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- QUOTE REQUESTS (견적 요청)
-- ============================================
CREATE TABLE quote_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_type project_type NOT NULL,
  style garden_style,
  location TEXT NOT NULL,
  area NUMERIC(10,2) NOT NULL,
  current_photos JSONB NOT NULL DEFAULT '[]',
  reference_images JSONB NOT NULL DEFAULT '[]',
  budget TEXT,
  preferred_schedule TEXT,
  requirements TEXT DEFAULT '',
  extras JSONB NOT NULL DEFAULT '[]',
  status quote_request_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quote_requests_customer_id ON quote_requests(customer_id);
CREATE INDEX idx_quote_requests_status ON quote_requests(status);
CREATE INDEX idx_quote_requests_created_at ON quote_requests(created_at DESC);

CREATE TRIGGER quote_requests_updated_at
  BEFORE UPDATE ON quote_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- QUOTES (견적서)
-- ============================================
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_request_id UUID NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC(12,0) NOT NULL DEFAULT 0,
  tax NUMERIC(12,0) NOT NULL DEFAULT 0,
  total NUMERIC(12,0) NOT NULL DEFAULT 0,
  valid_until DATE,
  notes TEXT DEFAULT '',
  payment_terms TEXT DEFAULT '',
  version INTEGER NOT NULL DEFAULT 1,
  status quote_status NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotes_quote_request_id ON quotes(quote_request_id);
CREATE INDEX idx_quotes_company_id ON quotes(company_id);
CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
CREATE INDEX idx_quotes_status ON quotes(status);

CREATE TRIGGER quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- CONTRACTS (계약서)
-- ============================================
CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT DEFAULT '',
  start_date DATE,
  end_date DATE,
  total_amount NUMERIC(12,0) NOT NULL DEFAULT 0,
  payment_schedule JSONB NOT NULL DEFAULT '[]',
  warranty_terms TEXT DEFAULT '',
  special_terms TEXT DEFAULT '',
  customer_signature TEXT,
  company_signature TEXT,
  status contract_status NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contracts_company_id ON contracts(company_id);
CREATE INDEX idx_contracts_customer_id ON contracts(customer_id);
CREATE INDEX idx_contracts_status ON contracts(status);

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- BLOG POSTS (블로그)
-- ============================================
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT DEFAULT '',
  excerpt TEXT DEFAULT '',
  cover_image_url TEXT,
  category blog_category NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]',
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX idx_blog_posts_published_at ON blog_posts(published_at DESC);

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- REVIEWS (리뷰)
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  design_rating NUMERIC(2,1) NOT NULL CHECK (design_rating >= 1 AND design_rating <= 5),
  quality_rating NUMERIC(2,1) NOT NULL CHECK (quality_rating >= 1 AND quality_rating <= 5),
  communication_rating NUMERIC(2,1) NOT NULL CHECK (communication_rating >= 1 AND communication_rating <= 5),
  schedule_rating NUMERIC(2,1) NOT NULL CHECK (schedule_rating >= 1 AND schedule_rating <= 5),
  value_rating NUMERIC(2,1) NOT NULL CHECK (value_rating >= 1 AND value_rating <= 5),
  content TEXT DEFAULT '',
  images JSONB NOT NULL DEFAULT '[]',
  company_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_company_id ON reviews(company_id);
CREATE INDEX idx_reviews_customer_id ON reviews(customer_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FLOTREN SUBSCRIPTIONS (조경관리 구독)
-- ============================================
CREATE TABLE flotren_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan flotren_plan NOT NULL,
  garden_area NUMERIC(10,2),
  monthly_price NUMERIC(10,0) NOT NULL,
  start_date DATE NOT NULL,
  status subscription_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flotren_subscriptions_customer_id ON flotren_subscriptions(customer_id);
CREATE INDEX idx_flotren_subscriptions_status ON flotren_subscriptions(status);

CREATE TRIGGER flotren_subscriptions_updated_at
  BEFORE UPDATE ON flotren_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- CHAT ROOMS
-- ============================================
CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  quote_request_id UUID REFERENCES quote_requests(id),
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_rooms_customer_id ON chat_rooms(customer_id);
CREATE INDEX idx_chat_rooms_company_id ON chat_rooms(company_id);

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB NOT NULL DEFAULT '[]',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'CUSTOMER')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- UPDATE COMPANY RATING (trigger on review insert/update)
-- ============================================
CREATE OR REPLACE FUNCTION update_company_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE companies
  SET
    rating = (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE company_id = NEW.company_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE company_id = NEW.company_id)
  WHERE id = NEW.company_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_change
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_company_rating();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved companies are viewable by everyone"
  ON companies FOR SELECT USING (is_approved = true);

CREATE POLICY "Company owners can view own company"
  ON companies FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Company owners can insert own company"
  ON companies FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Company owners can update own company"
  ON companies FOR UPDATE USING (auth.uid() = user_id);

-- Portfolios
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published portfolios are viewable by everyone"
  ON portfolios FOR SELECT USING (is_published = true);

CREATE POLICY "Company can manage own portfolios"
  ON portfolios FOR ALL USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

-- Quote Requests
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own quote requests"
  ON quote_requests FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Companies can view matched quote requests"
  ON quote_requests FOR SELECT USING (
    EXISTS (SELECT 1 FROM quotes WHERE quotes.quote_request_id = quote_requests.id AND quotes.company_id IN (SELECT id FROM companies WHERE user_id = auth.uid()))
    OR status = 'PENDING'
  );

CREATE POLICY "Customers can create quote requests"
  ON quote_requests FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customers can update own quote requests"
  ON quote_requests FOR UPDATE USING (auth.uid() = customer_id);

-- Quotes
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view quotes sent to them"
  ON quotes FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Companies can manage own quotes"
  ON quotes FOR ALL USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

-- Contracts
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view own contracts"
  ON contracts FOR SELECT USING (
    auth.uid() = customer_id OR
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Companies can create contracts"
  ON contracts FOR INSERT WITH CHECK (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Participants can update own contracts"
  ON contracts FOR UPDATE USING (
    auth.uid() = customer_id OR
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

-- Blog Posts
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published posts are viewable by everyone"
  ON blog_posts FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage all posts"
  ON blog_posts FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Customers can create reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Companies can reply to reviews"
  ON reviews FOR UPDATE USING (
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

-- Flotren Subscriptions
ALTER TABLE flotren_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own subscriptions"
  ON flotren_subscriptions FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON flotren_subscriptions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Chat Rooms
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view own chat rooms"
  ON chat_rooms FOR SELECT USING (
    auth.uid() = customer_id OR
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

CREATE POLICY "Participants can create chat rooms"
  ON chat_rooms FOR INSERT WITH CHECK (
    auth.uid() = customer_id OR
    company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
  );

-- Messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chat participants can view messages"
  ON messages FOR SELECT USING (
    chat_room_id IN (
      SELECT id FROM chat_rooms WHERE
        customer_id = auth.uid() OR
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Chat participants can send messages"
  ON messages FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    chat_room_id IN (
      SELECT id FROM chat_rooms WHERE
        customer_id = auth.uid() OR
        company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())
    )
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Run these separately in Supabase dashboard or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolios', 'portfolios', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('blog', 'blog', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('quotes', 'quotes', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('contracts', 'contracts', false);
