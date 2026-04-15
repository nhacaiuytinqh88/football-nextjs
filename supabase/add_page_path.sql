-- Add page_path column for flexible page content matching

-- Step 1: Add page_path column
ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS page_path VARCHAR(255) NULL;

-- Step 2: Migrate existing page_content to use page_path
UPDATE articles 
SET page_path = CASE 
  -- League intro: /giai-dau/39
  WHEN page_type = 'league_intro' AND league_id IS NOT NULL 
    THEN '/giai-dau/' || league_id
  
  -- Team intro: /doi-bong/33
  WHEN page_type = 'team_intro' AND match_id IS NOT NULL 
    THEN '/doi-bong/' || match_id
  
  -- Static pages
  WHEN page_type = 'odds_guide' THEN '/ty-le-keo'
  WHEN page_type = 'standings_guide' THEN '/bang-xep-hang'
  WHEN page_type = 'fixtures_guide' THEN '/lich-thi-dau'
  
  ELSE NULL
END
WHERE content_type = 'page_content';

-- Step 3: Create index for fast lookup
CREATE INDEX IF NOT EXISTS idx_articles_page_path ON articles(page_path) WHERE page_path IS NOT NULL;

-- Step 4: Verify migration
SELECT 
  page_type,
  page_path,
  COUNT(*) as count
FROM articles 
WHERE content_type = 'page_content'
GROUP BY page_type, page_path
ORDER BY page_type;

SELECT '✅ page_path column added successfully!' as status;
