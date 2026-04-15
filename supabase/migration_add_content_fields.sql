-- ============================================================
-- MIGRATION: Add content_type, entity_type, entity_id fields
-- Mở rộng bảng articles để hỗ trợ nhiều loại nội dung
-- ============================================================

-- Thêm các cột mới
ALTER TABLE public.articles 
  ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'match_preview'
    CHECK (content_type IN ('match_preview', 'league_intro', 'team_intro', 'odds_guide', 'standings_guide', 'fixtures_intro', 'general')),
  ADD COLUMN IF NOT EXISTS entity_type TEXT
    CHECK (entity_type IN ('match', 'league', 'team', 'page', null)),
  ADD COLUMN IF NOT EXISTS entity_id INTEGER;

-- Tạo index để query nhanh
CREATE INDEX IF NOT EXISTS articles_entity_idx ON public.articles(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS articles_content_type_idx ON public.articles(content_type);

-- Migrate dữ liệu cũ
UPDATE public.articles 
SET 
  content_type = 'match_preview',
  entity_type = 'match',
  entity_id = match_id
WHERE match_id IS NOT NULL AND entity_id IS NULL;

UPDATE public.articles 
SET 
  content_type = 'league_intro',
  entity_type = 'league',
  entity_id = league_id
WHERE league_id IS NOT NULL AND match_id IS NULL AND entity_id IS NULL;

-- Comment
COMMENT ON COLUMN public.articles.content_type IS 'Loại nội dung: match_preview, league_intro, team_intro, odds_guide, etc.';
COMMENT ON COLUMN public.articles.entity_type IS 'Loại entity: match, league, team, page, null';
COMMENT ON COLUMN public.articles.entity_id IS 'ID của entity tương ứng (match_id, league_id, team_id)';
