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
 * Lấy nội dung cho bất kỳ trang nào dựa trên page_path
 * @param pagePath - Đường dẫn trang (VD: '/giai-dau/39', '/ty-le-keo', '/lich-thi-dau')
 */
export async function getPageContentByPath(pagePath: string): Promise<PageContent | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('content_type', 'page_content')
    .eq('page_path', pagePath)
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
 * Lấy nội dung cho trang giải đấu
 */
export async function getLeagueContent(leagueId: number): Promise<PageContent | null> {
  return getPageContentByPath(`/giai-dau/${leagueId}`)
}

/**
 * Lấy nội dung cho trang đội bóng
 */
export async function getTeamContent(teamId: number): Promise<PageContent | null> {
  return getPageContentByPath(`/doi-bong/${teamId}`)
}

/**
 * Lấy nội dung cho các trang tĩnh
 */
export async function getPageContent(
  pageType: 'odds' | 'standings' | 'fixtures'
): Promise<PageContent | null> {
  const pathMap = {
    odds: '/ty-le-keo',
    standings: '/bang-xep-hang',
    fixtures: '/lich-thi-dau',
  }
  return getPageContentByPath(pathMap[pageType])
}
