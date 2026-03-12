-- Projects table: tracks project progress after contract is signed
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  customer_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'PREPARING' CHECK (status IN ('PREPARING', 'IN_PROGRESS', 'INSPECTION', 'COMPLETED')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  start_date DATE,
  expected_end_date DATE,
  actual_end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project milestones
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  images JSONB DEFAULT '[]',
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger for projects
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;

-- Projects: customer and company can read their own projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() IN (SELECT user_id FROM companies WHERE id = company_id));

-- Projects: company can update their projects
CREATE POLICY "Company can update projects" ON projects
  FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM companies WHERE id = company_id));

-- Projects: company can insert projects
CREATE POLICY "Company can insert projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT user_id FROM companies WHERE id = company_id));

-- Milestones: same access as projects
CREATE POLICY "Users can view milestones" ON project_milestones
  FOR SELECT USING (project_id IN (SELECT id FROM projects WHERE customer_id = auth.uid() OR company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));

CREATE POLICY "Company can manage milestones" ON project_milestones
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE company_id IN (SELECT id FROM companies WHERE user_id = auth.uid())));

-- Add project_status enum type alternative
COMMENT ON TABLE projects IS 'Tracks landscaping project progress from contract signing to completion';
COMMENT ON TABLE project_milestones IS 'Individual milestones/phases within a project';
