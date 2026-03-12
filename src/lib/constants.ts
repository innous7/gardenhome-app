export const SITE_NAME = 'GardenHome';
export const SITE_NAME_KR = '조경홈';
export const SITE_DESCRIPTION = '당신의 정원, 전문가와 함께 - 조경 전문 중개 플랫폼';
export const FLOTREN_NAME = 'Flotren';
export const FLOTREN_NAME_KR = '플로트렌';

export const PROJECT_TYPES: Record<string, string> = {
  GARDEN: '정원 조경',
  ROOFTOP: '옥상 조경',
  VERANDA: '베란다 조경',
  COMMERCIAL: '상업시설 조경',
  OTHER: '기타',
};

export const GARDEN_STYLES: Record<string, string> = {
  MODERN: '모던',
  TRADITIONAL: '한국 전통',
  NATURAL: '자연주의',
  MINIMAL: '미니멀',
  ENGLISH: '영국식',
  JAPANESE: '일본식',
  MIXED: '복합',
};

export const BLOG_CATEGORIES: Record<string, string> = {
  TREND: '조경 트렌드',
  PLANT_GUIDE: '식물 가이드',
  TIPS: '시공 팁',
  SEASONAL: '계절별 관리',
  COST_GUIDE: '비용 가이드',
  CASE_STUDY: '시공 사례',
  NEWS: '소식',
};

export const QUOTE_STATUS_LABELS: Record<string, string> = {
  DRAFT: '작성 중',
  SENT: '발송됨',
  VIEWED: '확인됨',
  ACCEPTED: '승인됨',
  REJECTED: '거절됨',
};

export const FLOTREN_PLANS = {
  BASIC: { name: '기본', visits: '월 1회', price: 99000 },
  STANDARD: { name: '스탠다드', visits: '월 2회', price: 199000 },
  PREMIUM: { name: '프리미엄', visits: '주 1회', price: 399000 },
} as const;

export const NAV_ITEMS = [
  { label: '탐색', href: '/explore' },
  { label: '조경회사', href: '/companies' },
  { label: '블로그', href: '/blog' },
  { label: '커뮤니티', href: '/community' },
  { label: '식물도감', href: '/plants' },
  { label: '조경관리', href: '/flotren' },
] as const;

export const EXTRAS_OPTIONS = [
  '수경시설 (연못/분수)',
  '야외 조명',
  '울타리/펜스',
  '텃밭',
  '데크/퍼골라',
  '잔디',
  '자동 관수 시스템',
  '야외 가구',
] as const;

export const BUDGET_RANGES = [
  '500만원 이하',
  '500만원 ~ 1,000만원',
  '1,000만원 ~ 3,000만원',
  '3,000만원 ~ 5,000만원',
  '5,000만원 ~ 1억원',
  '1억원 이상',
  '미정 (상담 후 결정)',
] as const;
