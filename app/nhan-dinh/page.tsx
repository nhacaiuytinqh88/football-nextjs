import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import ArticleCard from '@/components/ui/ArticleCard'
import { TRACKED_LEAGUES } from '@/lib/services/standings'

export const metadata: Metadata = {
  title: 'Nhận định & Dự đoán bóng đá',
  description: 'Nhận định, phân tích chuyên sâu và dự đoán kết quả các trận đấu bóng đá.',
}

// Logo giải đấu để hiển thị trong filter
const LEAGUE_LOGOS: Record<number, string> = Object.fromEntries(
  TRACKED_LEAGUES.map(l => [l.id, `https://media.api-sports.io/football/leagues/${l.id}.png`])
)

async function ArticleList({ leagueId }: { leagueId?: number }) {
  let query = supabase
    .from('articles')
    .select('id, title, slug, excerpt, cover_image, author, published_at, match_id, league_id')
    .eq('status', 'published')
    // Chỉ lấy bài viết nhận định (slug bắt đầu với "nhan-dinh-")
    // Loại bỏ các bài content page: gioi-thieu-*, huong-dan-*, lich-su-*
    .like('slug', 'nhan-dinh-%')
    .order('published_at', { ascending: false })
    .limit(20)

  if (leagueId) {
    query = query.eq('league_id', leagueId)
  }

  const { data: articles } = await query

  if (!articles || articles.length === 0) {
    return (
      <div className="px-4 py-12 text-center text-sm text-gray-400">
        {leagueId ? 'Chưa có bài viết nào cho giải đấu này' : 'Chưa có bài viết nào'}
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-50">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}

export default async function NhanDinhPage(props: PageProps<'/nhan-dinh'>) {
  const { league: leagueParam } = await props.searchParams ?? {}
  const selectedLeagueId = typeof leagueParam === 'string' ? parseInt(leagueParam) : undefined

  const selectedLeague = selectedLeagueId
    ? TRACKED_LEAGUES.find(l => l.id === selectedLeagueId)
    : undefined

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 bg-green-700 px-4 py-3">
        <FileText size={15} className="text-white" />
        <h1 className="text-sm font-semibold text-white">Nhận định & Dự đoán</h1>
        {selectedLeague && (
          <span className="ml-1 text-xs text-green-200">· {selectedLeague.name}</span>
        )}
      </div>

      {/* Filter giải đấu — scrollable */}
      <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 bg-gray-50">
        {/* Tab "Tất cả" */}
        <Link
          href="/nhan-dinh"
          className={`shrink-0 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
            !selectedLeagueId
              ? 'border-b-2 border-green-700 text-green-700 bg-white'
              : 'text-gray-500 hover:text-green-600'
          }`}
        >
          Tất cả
        </Link>
        {TRACKED_LEAGUES.map((league) => {
          const isActive = selectedLeagueId === league.id
          return (
            <Link
              key={league.id}
              href={`/nhan-dinh?league=${league.id}`}
              className={`flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-b-2 border-green-700 text-green-700 bg-white'
                  : 'text-gray-500 hover:text-green-600'
              }`}
            >
              <div className="relative h-4 w-4 shrink-0">
                <Image
                  src={LEAGUE_LOGOS[league.id]}
                  alt={league.name}
                  fill
                  className="object-contain"
                  sizes="16px"
                />
              </div>
              {league.name}
            </Link>
          )
        })}
      </div>

      {/* Danh sách bài viết */}
      <ArticleList leagueId={selectedLeagueId} />
    </div>
  )
}
