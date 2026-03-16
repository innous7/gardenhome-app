-- ============================================
-- Admin RLS policies for core tables
-- profiles, companies, portfolios 테이블에 관리자 권한 추가
-- Supabase Dashboard > SQL Editor 에서 실행하세요
-- ============================================

-- Profiles: 관리자가 모든 프로필 수정/삭제 가능
CREATE POLICY "Admins can manage all profiles"
  ON profiles FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Companies: 관리자가 모든 회사 조회/수정/삭제 가능
CREATE POLICY "Admins can manage all companies"
  ON companies FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Portfolios: 관리자가 모든 포트폴리오 조회/수정/삭제 가능
CREATE POLICY "Admins can manage all portfolios"
  ON portfolios FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );
