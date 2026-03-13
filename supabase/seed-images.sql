-- GardenHome 시드 데이터 이미지 업데이트
-- Supabase SQL Editor에서 실행하세요
-- Unsplash 무료 이미지 사용

-- ============================================
-- 1. PORTFOLIOS 커버 이미지
-- ============================================
UPDATE portfolios SET cover_image_url = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80' WHERE id = '00000000-0000-0000-2000-000000000001'; -- 판교 모던 정원
UPDATE portfolios SET cover_image_url = 'https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&q=80' WHERE id = '00000000-0000-0000-2000-000000000002'; -- 용인 한국식 정원
UPDATE portfolios SET cover_image_url = 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&q=80' WHERE id = '00000000-0000-0000-2000-000000000003'; -- 성수동 옥상정원
UPDATE portfolios SET cover_image_url = 'https://images.unsplash.com/photo-1558293842-c0fd3db86157?w=800&q=80' WHERE id = '00000000-0000-0000-2000-000000000004'; -- 파주 영국식 코티지
UPDATE portfolios SET cover_image_url = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80' WHERE id = '00000000-0000-0000-2000-000000000005'; -- 강남 미니멀 정원
UPDATE portfolios SET cover_image_url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80' WHERE id = '00000000-0000-0000-2000-000000000006'; -- 제주 자연주의 정원
UPDATE portfolios SET cover_image_url = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80' WHERE id = '00000000-0000-0000-2000-000000000007'; -- 한남동 베란다 정원
UPDATE portfolios SET cover_image_url = 'https://images.unsplash.com/photo-1464823063530-08f10ed1a2dd?w=800&q=80' WHERE id = '00000000-0000-0000-2000-000000000008'; -- 양평 일본식 젠 가든

-- ============================================
-- 2. COMPANIES 로고 이미지
-- ============================================
UPDATE companies SET logo_url = 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=200&q=80' WHERE id = '00000000-0000-0000-1000-000000000001'; -- 그린가든 조경
UPDATE companies SET logo_url = 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=200&q=80' WHERE id = '00000000-0000-0000-1000-000000000002'; -- 자연과 사람들
UPDATE companies SET logo_url = 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=200&q=80' WHERE id = '00000000-0000-0000-1000-000000000003'; -- 모던스케이프
UPDATE companies SET logo_url = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&q=80' WHERE id = '00000000-0000-0000-1000-000000000004'; -- 숲속정원

-- ============================================
-- 3. BLOG POSTS 커버 이미지
-- ============================================
UPDATE blog_posts SET cover_image_url = 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&q=80' WHERE id = '00000000-0000-0000-3000-000000000001'; -- 2024 조경 트렌드
UPDATE blog_posts SET cover_image_url = 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80' WHERE id = '00000000-0000-0000-3000-000000000002'; -- 초보자 식물 가이드
UPDATE blog_posts SET cover_image_url = 'https://images.unsplash.com/photo-1598902108854-d1446a420cbc?w=800&q=80' WHERE id = '00000000-0000-0000-3000-000000000003'; -- 정원 조경 비용
UPDATE blog_posts SET cover_image_url = 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&q=80' WHERE id = '00000000-0000-0000-3000-000000000004'; -- 봄맞이 정원 관리

-- ============================================
-- 4. PLANTS 이미지
-- ============================================
UPDATE plants SET image_url = 'https://images.unsplash.com/photo-1596438459194-f275f413d6ff?w=600&q=80' WHERE id = '00000000-0000-0000-5000-000000000001'; -- 수국
UPDATE plants SET image_url = 'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?w=600&q=80' WHERE id = '00000000-0000-0000-5000-000000000002'; -- 단풍나무
UPDATE plants SET image_url = 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=600&q=80' WHERE id = '00000000-0000-0000-5000-000000000003'; -- 라벤더
UPDATE plants SET image_url = 'https://images.unsplash.com/photo-1542273917363-1b1f3cb937a9?w=600&q=80' WHERE id = '00000000-0000-0000-5000-000000000004'; -- 소나무
UPDATE plants SET image_url = 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&q=80' WHERE id = '00000000-0000-0000-5000-000000000005'; -- 호스타
UPDATE plants SET image_url = 'https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&q=80' WHERE id = '00000000-0000-0000-5000-000000000006'; -- 장미
UPDATE plants SET image_url = 'https://images.unsplash.com/photo-1558635924-b60e7d431e75?w=600&q=80' WHERE id = '00000000-0000-0000-5000-000000000007'; -- 잔디
UPDATE plants SET image_url = 'https://images.unsplash.com/photo-1567878889955-928d289580fc?w=600&q=80' WHERE id = '00000000-0000-0000-5000-000000000008'; -- 대나무

-- ============================================
-- 5. COMMUNITY POSTS 이미지 (자랑글에만)
-- ============================================
UPDATE community_posts SET images = '["https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80"]'::jsonb WHERE id = '00000000-0000-0000-6000-000000000001'; -- 베란다 정원
UPDATE community_posts SET images = '["https://images.unsplash.com/photo-1464823063530-08f10ed1a2dd?w=800&q=80"]'::jsonb WHERE id = '00000000-0000-0000-6000-000000000003'; -- 젠 가든 DIY
UPDATE community_posts SET images = '["https://images.unsplash.com/photo-1588880331179-bc9b93a8cb5e?w=800&q=80", "https://images.unsplash.com/photo-1558293842-c0fd3db86157?w=800&q=80"]'::jsonb WHERE id = '00000000-0000-0000-6000-000000000005'; -- 시공 1년 후기
