-- Final fix: Clean up everything and start fresh

-- Step 1: Drop all existing constraints
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_content_type_check;
ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_page_type_check;

-- Step 2: Fix invalid content_type values
UPDATE articles 
SET content_type = 'article',
    page_type = NULL
WHERE content_type NOT IN ('article', 'page_content');

-- Step 3: Fix page_type for articles
UPDATE articles 
SET page_type = NULL
WHERE content_type = 'article';

-- Step 4: Fix page_type for page_content
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

-- Step 5: Ensure no NULL page_type for page_content
UPDATE articles 
SET page_type = 'general'
WHERE content_type = 'page_content' AND page_type IS NULL;

-- Step 6: Verify data before adding constraints
SELECT 
  content_type, 
  page_type, 
  COUNT(*) as count,
  CASE 
    WHEN content_type = 'article' AND page_type IS NOT NULL THEN '❌ INVALID'
    WHEN content_type = 'page_content' AND page_type IS NULL THEN '❌ INVALID'
    WHEN content_type NOT IN ('article', 'page_content') THEN '❌ INVALID'
    ELSE '✅ OK'
  END as validation
FROM articles 
GROUP BY content_type, page_type
ORDER BY content_type, page_type;

-- Step 7: Add constraints (only if all rows show ✅ OK above)
ALTER TABLE articles 
ADD CONSTRAINT articles_content_type_check 
CHECK (content_type IN ('article', 'page_content'));

ALTER TABLE articles 
ADD CONSTRAINT articles_page_type_check 
CHECK (
  (content_type = 'article' AND page_type IS NULL) OR
  (content_type = 'page_content' AND page_type IN ('league_intro', 'team_intro', 'odds_guide', 'standings_guide', 'fixtures_guide', 'general'))
);

-- Step 8: Success message
SELECT '✅ Migration completed successfully!' as status;
