-- Migration: Add page_type column to articles table
-- Date: 2026-04-16
-- Note: content_type column already exists, only adding page_type

-- Step 1: Add page_type column (only used when content_type = 'page_content')
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS page_type VARCHAR(30) NULL;

-- Step 2: Update existing records based on slug patterns
UPDATE articles 
SET page_type = CASE 
  WHEN slug LIKE 'gioi-thieu-%' AND league_id > 0 THEN 'league_intro'
  WHEN slug LIKE 'gioi-thieu-%' AND match_id IS NOT NULL THEN 'team_intro'
  WHEN slug LIKE 'lich-su-%' THEN 'team_intro'
  WHEN slug LIKE 'huong-dan-ty-le-keo%' THEN 'odds_guide'
  WHEN slug LIKE 'huong-dan-bang-xep-hang%' THEN 'standings_guide'
  WHEN slug LIKE 'huong-dan-lich-thi-dau%' THEN 'fixtures_guide'
  ELSE 'general'
END
WHERE content_type = 'page_content';

-- Step 3: Add check constraint for page_type
ALTER TABLE articles 
DROP CONSTRAINT IF EXISTS articles_page_type_check;

ALTER TABLE articles 
ADD CONSTRAINT articles_page_type_check 
CHECK (
  (content_type = 'article' AND page_type IS NULL) OR
  (content_type = 'page_content' AND page_type IN ('league_intro', 'team_intro', 'odds_guide', 'standings_guide', 'fixtures_guide', 'general'))
);

-- Step 4: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_page_type ON articles(page_type) WHERE page_type IS NOT NULL;

-- Verify the migration
SELECT content_type, page_type, COUNT(*) as count 
FROM articles 
GROUP BY content_type, page_type
ORDER BY content_type, page_type;
