-- ============================================
-- GardenHome Storage 버킷 생성
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 포트폴리오 이미지 (시공 전/후, 과정 사진)
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolios', 'portfolios', true);

-- 프로필 아바타
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- 블로그 이미지
INSERT INTO storage.buckets (id, name, public) VALUES ('blog', 'blog', true);

-- 견적서/계약서 첨부파일 (비공개)
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);


-- ============================================
-- Storage RLS Policies
-- ============================================

-- 인증된 사용자는 파일 업로드 가능
CREATE POLICY "Authenticated users can upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- 공개 버킷의 파일은 누구나 조회 가능
CREATE POLICY "Public read for public buckets" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id IN ('portfolios', 'avatars', 'blog'));

-- 자신이 업로드한 파일만 수정/삭제 가능 (폴더명 = user id)
CREATE POLICY "Users can manage own uploads" ON storage.objects
  FOR ALL TO authenticated
  USING (auth.uid()::text = (storage.foldername(name))[1]);
