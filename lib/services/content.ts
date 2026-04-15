import { supabase } from '@/lib/supabase'

export type ContentType = 
  | 'match_preview' 
  | 'league_intro' 
  | 'team_intro' 
  | 'odds_guide' 
  | 'standings_guide' 
  | 'fixtures_intro' 
  | 'general'

export type EntityType = 'match' | 'league' | 'team' | 'page' | null

export interface PageContent {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image: string | null
  content_type: ContentType
  entity_type: EntityType
  entity_id: number | null
  author: string
  published_at: string
  created_at: string
  updated_at: string
}

/**
 * Lấy nội dung cho trang giải đấu
 */
export async function getLeagueContent(leagueId: number): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('entity_type', 'league')
    .eq('entity_id', leagueId)
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
 */
export async function getTeamContent(teamId: number): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('entity_type', 'team')
    .eq('entity_id', teamId)
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
 */
export async function getPageContent(contentType: ContentType): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('content_type', contentType)
    .eq('entity_type', 'page')
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

/**
 * Lấy tất cả nội dung theo entity
 */
export async function getContentByEntity(
  entityType: EntityType,
  entityId: number
): Promise<PageContent[]> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching content by entity:', error)
    return []
  }

  return data || []
}
