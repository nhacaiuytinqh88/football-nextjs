import { supabase } from '@/lib/supabase'

export interface PageContent {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image: string | null
  author: string
  published_at: string
  created_at: string
  updated_at: string
}

/**
 * Lấy nội dung cho trang giải đấu
 * Quy ước: content_type = 'page_content', page_type = 'league_intro', league_id có giá trị
 */
export async function getLeagueContent(leagueId: number): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('content_type', 'page_content')
    .eq('page_type', 'league_intro')
    .eq('league_id', leagueId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching league content:', error)
    return null
  }

  return data
}

/**
 * Lấy nội dung cho trang đội bóng
 * Quy ước: content_type = 'page_content', page_type = 'team_intro', match_id = team_id
 */
export async function getTeamContent(teamId: number): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('content_type', 'page_content')
    .eq('page_type', 'team_intro')
    .eq('match_id', teamId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching team content:', error)
    return null
  }

  return data
}

/**
 * Lấy nội dung cho các trang tĩnh (odds guide, standings guide, etc.)
 * Quy ước: content_type = 'page_content', page_type = loại trang
 */
export async function getPageContent(
  pageType: 'odds_guide' | 'standings_guide' | 'fixtures_guide'
): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('content_type', 'page_content')
    .eq('page_type', pageType)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching page content:', error)
    return null
  }

  return data
}
