-- GardenHome Extension Tables
-- Run this in Supabase SQL Editor after the main schema

-- ============================================
-- ENUMS (Extensions)
-- ============================================
CREATE TYPE visit_status AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE report_status AS ENUM ('DRAFT', 'PUBLISHED');

-- ============================================
-- FLOTREN VISIT SCHEDULES (방문 스케줄)
-- ============================================
CREATE TABLE flotren_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES flotren_subscriptions(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES profiles(id),
  scheduled_date DATE NOT NULL,
  scheduled_time TEXT DEFAULT '10:00',
  status visit_status NOT NULL DEFAULT 'SCHEDULED',
  notes TEXT DEFAULT '',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flotren_visits_subscription ON flotren_visits(subscription_id);
CREATE INDEX idx_flotren_visits_manager ON flotren_visits(manager_id);
CREATE INDEX idx_flotren_visits_date ON flotren_visits(scheduled_date);
CREATE INDEX idx_flotren_visits_status ON flotren_visits(status);

CREATE TRIGGER flotren_visits_updated_at
  BEFORE UPDATE ON flotren_visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FLOTREN VISIT REPORTS (관리 리포트)
-- ============================================
CREATE TABLE flotren_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES flotren_visits(id) ON DELETE CASCADE,
  subscription_id UUID NOT NULL REFERENCES flotren_subscriptions(id) ON DELETE CASCADE,
  manager_id UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  summary TEXT DEFAULT '',
  work_done JSONB NOT NULL DEFAULT '[]',  -- ["잔디 깎기", "잡초 제거", ...]
  plant_health JSONB NOT NULL DEFAULT '{}', -- { overall: "GOOD", issues: [...] }
  photos JSONB NOT NULL DEFAULT '[]',  -- [{ url, caption }]
  recommendations TEXT DEFAULT '',
  next_visit_notes TEXT DEFAULT '',
  weather TEXT DEFAULT '',
  status report_status NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flotren_reports_visit ON flotren_reports(visit_id);
CREATE INDEX idx_flotren_reports_subscription ON flotren_reports(subscription_id);

CREATE TRIGGER flotren_reports_updated_at
  BEFORE UPDATE ON flotren_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FLOTREN MANAGERS (관리사 배정)
-- ============================================
CREATE TABLE flotren_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  specialties JSONB NOT NULL DEFAULT '[]',
  service_areas JSONB NOT NULL DEFAULT '[]',
  max_subscriptions INTEGER NOT NULL DEFAULT 20,
  active_subscriptions INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_flotren_managers_user ON flotren_managers(user_id);

CREATE TRIGGER flotren_managers_updated_at
  BEFORE UPDATE ON flotren_managers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- FLOTREN MANAGER ASSIGNMENTS (관리사-구독 매핑)
-- ============================================
CREATE TABLE flotren_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES flotren_subscriptions(id) ON DELETE CASCADE,
  manager_id UUID NOT NULL REFERENCES flotren_managers(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE(subscription_id, manager_id)
);

CREATE INDEX idx_flotren_assignments_sub ON flotren_assignments(subscription_id);
CREATE INDEX idx_flotren_assignments_mgr ON flotren_assignments(manager_id);

-- ============================================
-- RLS for extension tables
-- ============================================

-- Visits
ALTER TABLE flotren_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own visits"
  ON flotren_visits FOR SELECT USING (
    subscription_id IN (SELECT id FROM flotren_subscriptions WHERE customer_id = auth.uid())
  );

CREATE POLICY "Admins can manage all visits"
  ON flotren_visits FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Reports
ALTER TABLE flotren_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own reports"
  ON flotren_reports FOR SELECT USING (
    subscription_id IN (SELECT id FROM flotren_subscriptions WHERE customer_id = auth.uid())
  );

CREATE POLICY "Admins can manage all reports"
  ON flotren_reports FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Managers
ALTER TABLE flotren_managers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view managers"
  ON flotren_managers FOR SELECT USING (true);

CREATE POLICY "Admins can manage managers"
  ON flotren_managers FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Assignments
ALTER TABLE flotren_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own assignments"
  ON flotren_assignments FOR SELECT USING (
    subscription_id IN (SELECT id FROM flotren_subscriptions WHERE customer_id = auth.uid())
  );

CREATE POLICY "Admins can manage assignments"
  ON flotren_assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ============================================
-- FULL TEXT SEARCH INDEX (통합 검색용)
-- ============================================

-- Add text search columns for better performance
ALTER TABLE portfolios ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE plants ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create search indexes
CREATE INDEX IF NOT EXISTS idx_portfolios_search ON portfolios USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_companies_search ON companies USING gin(search_vector);
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING gin(search_vector);
