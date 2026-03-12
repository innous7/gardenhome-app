-- Plants encyclopedia table
CREATE TABLE IF NOT EXISTS plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  scientific_name TEXT,
  category TEXT NOT NULL CHECK (category IN ('TREE', 'SHRUB', 'FLOWER', 'GRASS', 'GROUND_COVER', 'CLIMBING', 'AQUATIC', 'INDOOR')),
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  images JSONB DEFAULT '[]',
  -- Care info
  sunlight TEXT CHECK (sunlight IN ('FULL_SUN', 'PARTIAL_SUN', 'SHADE')),
  watering TEXT CHECK (watering IN ('FREQUENT', 'MODERATE', 'LOW')),
  difficulty TEXT CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
  growth_rate TEXT CHECK (growth_rate IN ('FAST', 'MEDIUM', 'SLOW')),
  -- Climate
  climate_zones JSONB DEFAULT '[]',
  flowering_season JSONB DEFAULT '[]',
  -- Size
  height_min NUMERIC,
  height_max NUMERIC,
  -- Tags
  tags JSONB DEFAULT '[]',
  -- Care tips
  care_tips TEXT DEFAULT '',
  planting_tips TEXT DEFAULT '',
  pruning_tips TEXT DEFAULT '',
  -- Stats
  view_count INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plant tips/reviews from users
CREATE TABLE IF NOT EXISTS plant_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_id UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Triggers
CREATE TRIGGER update_plants_updated_at
  BEFORE UPDATE ON plants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE plant_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published plants" ON plants
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage plants" ON plants
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM profiles WHERE role = 'ADMIN')
  );

CREATE POLICY "Anyone can view tips" ON plant_tips
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add tips" ON plant_tips
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own tips" ON plant_tips
  FOR DELETE USING (auth.uid() = author_id);

-- Indexes
CREATE INDEX idx_plants_category ON plants(category);
CREATE INDEX idx_plants_name ON plants(name);
CREATE INDEX idx_plant_tips_plant ON plant_tips(plant_id, created_at DESC);

-- Seed some initial plant data
INSERT INTO plants (name, scientific_name, category, description, sunlight, watering, difficulty, growth_rate, climate_zones, flowering_season, height_min, height_max, tags, care_tips, planting_tips, pruning_tips) VALUES
('소나무', 'Pinus densiflora', 'TREE', '한국을 대표하는 상록침엽수로, 정원의 품격을 높여줍니다. 사계절 푸른 잎을 유지하며 한국적인 정원 분위기를 연출합니다.', 'FULL_SUN', 'LOW', 'MEDIUM', 'SLOW', '["중부", "남부", "제주"]', '[]', 3, 20, '["상록수", "한국정원", "전통"]', '배수가 잘 되는 토양에서 잘 자랍니다. 과습에 주의하세요.', '봄이나 가을에 식재하는 것이 좋습니다. 뿌리가 상하지 않도록 조심하세요.', '겨울에 불필요한 가지를 정리합니다.'),
('단풍나무', 'Acer palmatum', 'TREE', '가을 단풍이 아름다운 낙엽교목입니다. 봄의 새싹부터 가을 단풍까지 사계절 변화를 즐길 수 있습니다.', 'PARTIAL_SUN', 'MODERATE', 'MEDIUM', 'MEDIUM', '["중부", "남부"]', '[]', 3, 10, '["단풍", "낙엽수", "정원수"]', '반그늘에서 가장 아름다운 잎 색상을 보여줍니다.', '토양이 촉촉하고 배수가 좋은 곳에 식재하세요.', '늦겨울에 가지치기를 합니다.'),
('수국', 'Hydrangea macrophylla', 'SHRUB', '여름에 크고 화려한 꽃을 피우는 관목입니다. 토양 산도에 따라 꽃 색이 변하는 특성이 있습니다.', 'PARTIAL_SUN', 'FREQUENT', 'EASY', 'MEDIUM', '["중부", "남부", "제주"]', '["여름"]', 0.5, 2, '["여름꽃", "관목", "색변화"]', '물을 좋아하므로 토양이 마르지 않게 관리하세요. 산성 토양에서는 파란색, 알칼리성에서는 분홍색 꽃이 핍니다.', '반그늘 환경에서 가장 잘 자랍니다.', '꽃이 진 후 바로 아래 마디에서 잘라줍니다.'),
('철쭉', 'Rhododendron schlippenbachii', 'SHRUB', '봄에 분홍색 꽃을 피우는 한국 대표 관목입니다. 군식하면 화려한 봄 정원을 연출할 수 있습니다.', 'PARTIAL_SUN', 'MODERATE', 'EASY', 'SLOW', '["중부", "남부"]', '["봄"]', 1, 3, '["봄꽃", "관목", "한국자생"]', '산성 토양을 좋아합니다. 석회질 토양은 피하세요.', '가을에 식재하는 것이 좋습니다.', '꽃이 진 직후 전정합니다.'),
('잔디 (한국잔디)', 'Zoysia japonica', 'GRASS', '한국 기후에 가장 적합한 잔디로, 관리가 비교적 쉽습니다. 여름에 녹색, 겨울에 갈변합니다.', 'FULL_SUN', 'MODERATE', 'EASY', 'MEDIUM', '["중부", "남부", "제주"]', '[]', 0, 0.15, '["잔디", "지피", "기본"]', '봄에 배토와 비료를 주면 건강하게 자랍니다. 여름엔 주 1-2회 깊게 관수하세요.', '봄(4-5월)에 식재하는 것이 활착률이 높습니다.', '5-10월에 2-3주 간격으로 깎아줍니다.'),
('라벤더', 'Lavandula angustifolia', 'FLOWER', '보라색 꽃과 향기로운 향이 매력적인 허브식물입니다. 지중해성 기후를 좋아하며 건조한 환경에 강합니다.', 'FULL_SUN', 'LOW', 'MEDIUM', 'MEDIUM', '["중부", "남부"]', '["여름"]', 0.3, 0.6, '["허브", "향기", "보라색"]', '과습이 가장 큰 적입니다. 배수가 매우 잘 되는 토양에서 키우세요.', '봄에 식재하고, 뿌리가 물에 잠기지 않도록 합니다.', '꽃이 진 후 1/3 정도 잘라줍니다.'),
('담쟁이', 'Parthenocissus tricuspidata', 'CLIMBING', '벽면을 타고 올라가는 덩굴식물로, 가을 단풍이 아름답습니다. 벽면 녹화에 많이 사용됩니다.', 'PARTIAL_SUN', 'MODERATE', 'EASY', 'FAST', '["중부", "남부"]', '[]', 0, 15, '["덩굴", "벽면녹화", "단풍"]', '특별한 관리 없이도 잘 자랍니다. 원하지 않는 방향으로 뻗는 줄기를 정리해주세요.', '벽면이나 울타리 근처에 식재합니다.', '봄에 과도하게 자란 부분을 정리합니다.'),
('수선화', 'Narcissus', 'FLOWER', '이른 봄에 노란색 또는 흰색 꽃을 피우는 구근식물입니다. 한번 심으면 매년 꽃을 볼 수 있습니다.', 'FULL_SUN', 'MODERATE', 'EASY', 'MEDIUM', '["중부", "남부", "제주"]', '["봄"]', 0.15, 0.4, '["봄꽃", "구근", "초보추천"]', '꽃이 진 후에도 잎을 자르지 마세요. 자연스럽게 마를 때까지 두면 다음해 개화에 도움됩니다.', '가을(10-11월)에 구근을 심습니다. 깊이는 구근 높이의 2-3배.', '특별한 전정이 필요 없습니다.'),
('맥문동', 'Liriope muscari', 'GROUND_COVER', '그늘에서도 잘 자라는 상록 지피식물입니다. 정원의 가장자리나 나무 아래에 군식하면 효과적입니다.', 'SHADE', 'MODERATE', 'EASY', 'SLOW', '["중부", "남부", "제주"]', '["여름"]', 0.1, 0.3, '["지피", "그늘", "상록"]', '그늘에서 잘 자라며, 건조에도 비교적 강합니다.', '봄이나 가을에 포기나누기로 번식할 수 있습니다.', '봄에 묵은 잎을 정리하면 새잎이 깔끔하게 올라옵니다.'),
('스투키', 'Dracaena stuckyi', 'INDOOR', '공기정화 능력이 뛰어난 실내식물입니다. 물을 자주 주지 않아도 되어 관리가 매우 쉽습니다.', 'PARTIAL_SUN', 'LOW', 'EASY', 'SLOW', '["실내"]', '[]', 0.3, 1.5, '["공기정화", "실내", "초보추천"]', '과습에 매우 약합니다. 흙이 완전히 마른 후에 물을 주세요. 겨울에는 한달에 1회 정도.', '배수가 잘 되는 화분에 심으세요.', '특별한 전정이 필요 없습니다.');
