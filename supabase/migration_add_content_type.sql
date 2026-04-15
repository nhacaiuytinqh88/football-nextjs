-- Migration: Add content_type and page_type columns to articles table
-- Date: 2026-04-16

-- Step 1: Add content_type column with default value 'article'
ALTER TABLE articles 
ADD COLUMN content_type VARCHAR(20) DEFAULT 'article' NOT NULL;

-- Step 2: Add page_type column (only used when content_type = 'page_content')
ALTER TABLE articles 
ADD COLUMN page_type VARCHAR(30) NULL;

-- Step 3: Update existing records based on slug patterns
-- Content pages: gioi-thieu-*, huong-dan-*, lich-su-*
UPDATE articles 
SET content_type = 'page_content',
    page_type = CASE 
      WHEN slug LIKE 'gioi-thieu-%' AND league_id > 0 THEN 'league_intro'
      WHEN slug LIKE 'gioi-thieu-%' AND match_id IS NOT NULL THEN 'team_intro'
      WHEN slug LIKE 'lich-su-%' THEN 'team_intro'
      WHEN slug LIKE 'huong-dan-ty-le-keo%' THEN 'odds_guide'
      WHEN slug LIKE 'huong-dan-bang-xep-hang%' THEN 'standings_guide'
      ELSE 'general'
    END
WHERE slug LIKE 'gioi-thieu-%' 
   OR slug LIKE 'huong-dan-%' 
   OR slug LIKE 'lich-su-%';

-- Step 4: Add check constraints
ALTER TABLE articles 
ADD CONSTRAINT articles_content_type_check 
CHECK (content_type IN ('article', 'page_content'));

ALTER TABLE articles 
ADD CONSTRAINT articles_page_type_check 
CHECK (
  (content_type = 'article' AND page_type IS NULL) OR
  (content_type = 'page_content' AND page_type IN ('league_intro', 'team_intro', 'odds_guide', 'standings_guide', 'fixtures_guide', 'general'))
);

-- Step 5: Create indexes for better query performance
CREATE INDEX idx_articles_content_type ON articles(content_type);
CREATE INDEX idx_articles_page_type ON articles(page_type) WHERE page_type IS NOT NULL;

-- Verify the migration
SELECT content_type, page_type, COUNT(*) as count 
FROM articles 
GROUP BY content_type, page_type
ORDER BY content_type, page_type;
