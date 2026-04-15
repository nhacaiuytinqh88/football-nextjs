import Link from 'next/link'
import { Newspaper, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getOddsByLeague, getMatchWinner, getAsianHandicap, getOverUnder } from '@/lib/services/odds'
import { formatArticleDate } from '@/lib/date'
import OddsCompactRow from '@/components/ui/OddsCompactRow'

// Tin HOT từ Supabase
async function HotNews() {
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, published_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(5)

  if (!articles || articles.length === 0) {
    return (
      <div className="px-4 py-4 text-xs text-gray-400 text-center">Chưa có bài viết</div>
    )
  }

  return (
    <>
      <ul className="divide-y divide-gray-50">
        {articles.map((a) => (
          <li key={a.id}>
            <Link href={`/nhan-dinh/${a.slug}`} className="block px-4 py-3 hover:bg-red-50 transition-colors">
              <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{a.title}</p>
              <p className="mt-1 text-xs text-gray-400">{formatArticleDate(a.published_at)}</p>
            </Link>
          </li>
        ))}
      </ul>
      <div className="px-4 py-2 border-t border-gray-100">
        <Link href="/nhan-dinh" className="text-xs font-medium text-green-700 hover:underline">
          Xem tất cả →
        </Link>
      </div>
    </>
  )
}

// Kèo nổi bật — lấy 3 trận Premier League
async function FeaturedOdds() {
  try {
    const { odds } = await getOddsByLeague(39, undefined, 1, 8) // Premier League, Bet365
    const featured = odds.slice(0, 3)

    if (featured.length === 0) {
      return <div className="px-4 py-4 text-xs text-gray-400 text-center">Chưa có kèo</div>
    }

    // Fetch fixture details để lấy tên đội và logo
    const { fetchFixtureById } = await import('@/lib/api-football')
    const fixtures = await Promise.all(featured.map(o => fetchFixtureById(o.fixture.id)))

    return (
      <>
        {/* Header bảng */}
        <div className="bg-gray-800 border-b border-gray-600">
          <div className="flex items-center text-white text-[10px] font-semibold">
            <div className="flex-1 px-3 py-2">Trận đấu</div>
            <div className="w-14 border-l border-gray-700 text-center py-2">Chấp</div>
            <div className="w-12 border-l border-gray-700 text-center py-2">T/X</div>
            <div className="w-10 border-l border-gray-700 text-center py-2">1×2</div>
          </div>
        </div>
        
        <ul className="divide-y divide-gray-50">
          {featured.map((o, idx) => {
            const fixture = fixtures[idx]
            if (!fixture) return null

            const winner = getMatchWinner(o)
            const ah = getAsianHandicap(o)
            const ou = getOverUnder(o, '2.5')

            return (
              <li key={o.fixture.id}>
                <OddsCompactRow
                  fixtureId={o.fixture.id}
                  homeTeam={fixture.teams.home.name}
                  awayTeam={fixture.teams.away.name}
                  homeLogo={fixture.teams.home.logo}
                  awayLogo={fixture.teams.away.logo}
                  handicap={ah[0] ? {
                    label: ah[0].home.replace('Home ', ''),
                    homeOdd: ah[0].homeOdd,
                    awayOdd: ah[0].awayOdd,
                  } : undefined}
                  overUnder={ou ? {
                    label: '2.5',
                    over: ou.over,
                    under: ou.under,
                  } : undefined}
                  winner={winner ?? undefined}
                />
              </li>
            )
          })}
        </ul>
        <div className="px-4 py-2 border-t border-gray-100">
          <Link href="/ty-le-keo" className="text-xs font-medium text-green-700 hover:underline">
            Xem tất cả kèo →
          </Link>
        </div>
      </>
    )
  } catch {
    return <div className="px-4 py-4 text-xs text-gray-400 text-center">Đang cập nhật...</div>
  }
}

export default function RightSidebar() {
  return (
    <aside className="hidden xl:flex flex-col w-[25%] min-w-[200px] max-w-[280px] shrink-0">
      <div className="sticky top-[72px] space-y-4">
        {/* Tin tức HOT */}
        <div className="rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-red-600 px-4 py-3">
            <Newspaper size={14} className="text-white" />
            <h2 className="text-sm font-semibold text-white">Tin HOT</h2>
          </div>
          <HotNews />
        </div>

        {/* Kèo nổi bật */}
        <div className="rounded-xl bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-blue-700 px-4 py-3">
            <TrendingUp size={14} className="text-white" />
            <h2 className="text-sm font-semibold text-white">Kèo nổi bật</h2>
            <span className="ml-auto text-xs text-blue-200">Bet365</span>
          </div>
          <FeaturedOdds />
        </div>
      </div>
    </aside>
  )
}
