-- ============================================
-- company_edit_requests 테이블 생성
-- 파트너 회사 정보 수정 요청 → 관리자 승인 시스템
-- Supabase SQL Editor에서 실행하세요
-- ============================================

CREATE TABLE IF NOT EXISTS company_edit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  requested_changes JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_edit_requests_company ON company_edit_requests(company_id);
CREATE INDEX idx_edit_requests_status ON company_edit_requests(status);

-- RLS
ALTER TABLE company_edit_requests ENABLE ROW LEVEL SECURITY;

-- 파트너: 본인 요청 조회
CREATE POLICY "Users can view own edit requests" ON company_edit_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 파트너: 본인 요청 생성
CREATE POLICY "Users can create edit requests" ON company_edit_requests
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 파트너: 본인 pending 요청 삭제 (취소)
CREATE POLICY "Users can delete own pending requests" ON company_edit_requests
  FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');

-- 관리자: 모든 요청 조회
CREATE POLICY "Admins can view all edit requests" ON company_edit_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );

-- 관리자: 모든 요청 수정 (승인/거절)
CREATE POLICY "Admins can update edit requests" ON company_edit_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
    )
  );
