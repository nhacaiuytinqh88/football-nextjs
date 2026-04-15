-- Fix invalid content_type value

-- Step 1: Check what we have
SELECT id, title, slug, content_type, page_type, match_id, league_id
FROM articles
WHERE content_type NOT IN ('article', 'page_content');

-- Step 2: Fix 'match_preview' -> should be 'article' (it's a match article)
UPDATE articles 
SET content_type = 'article',
    page_type = NULL
WHERE content_type = 'match_preview';

-- Step 3: Verify fix
SELECT content_type, page_type, COUNT(*) as count 
FROM articles 
GROUP BY content_type, page_type
ORDER BY content_type, page_type;

-- Step 4: Now we can safely add the constraint
ALTER TABLE articles 
DROP CONSTRAINT IF EXISTS articles_content_type_check;

ALTER TABLE articles 
ADD CONSTRAINT articles_content_type_check 
CHECK (content_type IN ('article', 'page_content'));

ALTER TABLE articles 
DROP CONSTRAINT IF EXISTS articles_page_type_check;

ALTER TABLE articles 
ADD CONSTRAINT articles_page_type_check 
CHECK (
  (content_type = 'article' AND page_type IS NULL) OR
  (content_type = 'page_content' AND page_type IN ('league_intro', 'team_intro', 'odds_guide', 'standings_guide', 'fixtures_guide', 'general'))
);

SELECT 'All constraints added successfully!' as status;
