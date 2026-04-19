import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TrendingUp } from 'lucide-react'
import {
  getOddsByLeague,
  getBookmakers,
  getMatchWinner, getOverUnder, getAsianHandicap,
  getFirstHalfWinner, getFirstHalfOverUnder, getFirstHalfAsianHandicap,
  getCorrectScore,
} from '@/lib/services/odds'
import { TRACKED_LEAGUES } from '@/lib/services/standings'
import type { FixtureOdds } from '@/lib/api-football'
import { BookmakerSelect } from './BookmakerSelect'
import { OddsMatchRow } from './OddsMatchRow'
import PageContentSection from '@/components/ui/PageContent'
import { getPageContent, getCurrentPageContent } from '@/lib/services/content'

export async function generateMetadata(props: PageProps<'/ty-le-keo'>): Promise<Metadata> {
  const searchParams = await props.searchParams ?? {}
  
  // Lấy nội dung trang - ưu tiên content có query params, fallback về trang chính
  const pageContentWithParams = await getCurrentPageContent('/ty-le-keo', searchParams)
  const pageContentDefault = pageContentWithParams ? null : await getPageContent('odds')
  const pageContent = pageContentWithParams || pageContentDefault
  
  return {
    title: pageContent?.title || 'Tỷ lệ kèo bóng đá',
    description: pageContent?.excerpt || 'Tỷ lệ kèo bóng đá cập nhật từ Bet365 - kèo 1x2, châu Á, tài xỉu các giải hàng đầu.',
  }
}

function Skeleton() {
  return (
    <div className="space-y-px">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse bg-gray-50" />
      ))}
    </div>
  )
}

// Nhóm theo giải
async function OddsSection({ leagueId, bookmakerId }: { leagueId: number; bookmakerId: number }) {
  const { odds } = await getOddsByLeague(leagueId, undefined, 1, bookmakerId)

  if (odds.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-gray-400">
        Hiện không có trận sắp diễn ra cho giải này
      </div>
    )
  }

  // Fetch tất cả fixtures để lấy tên đội và logo
  const { fetchFixtureById } = await import('@/lib/api-football')
  const fixtureIds = odds.map(o => o.fixture.id)
  const fixtures = await Promise.all(fixtureIds.map(id => fetchFixtureById(id)))
  
  // Map fixture ID -> team info
  const fixtureTeams = new Map<number, { home: { name: string; logo: string }; away: { name: string; logo: string } }>()
  fixtures.forEach(f => {
    if (f) {
      fixtureTeams.set(f.fixture.id, {
        home: { name: f.teams.home.name, logo: f.teams.home.logo },
        away: { name: f.teams.away.name, logo: f.teams.away.logo }
      })
    }
  })

  // Nhóm theo league
  const grouped = odds.reduce<Record<number, FixtureOdds[]>>((acc, o) => {
    const lid = o.league.id
    if (!acc[lid]) acc[lid] = []
    acc[lid].push(o)
    return acc
  }, {})

  return (
    <div>
      {Object.values(grouped).map((group) => {
        const league = group[0].league
        return (
          <div key={league.id}>
            {/* Header giải */}
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2">
              <div className="relative h-4 w-4 shrink-0">
                <Image src={league.logo} alt={league.name} fill className="object-contain" sizes="16px" />
              </div>
              <span className="text-xs font-semibold text-gray-600">{league.country} · {league.name}</span>
              <div className="ml-auto flex items-center gap-3 text-[10px] text-green-700">
                <Link href={`/giai-dau/${league.id}?tab=lich`} className="hover:underline">Lịch</Link>
                <Link href={`/giai-dau/${league.id}?tab=bxh`} className="hover:underline">BXH</Link>
              </div>
            </div>
            {/* Rows */}
            <div>
              {group.map((o) => {
                const teams = fixtureTeams.get(o.fixture.id)
                
                // Chuẩn bị data cho client component
                const winner = getMatchWinner(o)
                const ou25 = getOverUnder(o, '2.5')
                const ah = getAsianHandicap(o)
                const ah1 = ah[0]
                const correctScore = getCorrectScore(o)

                const h1Winner = getFirstHalfWinner(o)
                const h1Ou = getFirstHalfOverUnder(o, '0.5') ?? getFirstHalfOverUnder(o, '1.5')
                const h1Ah = getFirstHalfAsianHandicap(o)
                const h1Ah1 = h1Ah[0]

                const handicapValues = ah1 ? [
                  { label: ah1.home.replace('Home ', ''), odd: ah1.homeOdd },
                  { label: ah1.away.replace('Away ', ''), odd: ah1.awayOdd },
                ] : [{ label: '', odd: '-' }, { label: '', odd: '-' }]

                const ouValues = ou25 ? [
                  { label: '2.5', odd: ou25.over },
                  { label: 'U', odd: ou25.under },
                ] : [{ label: '', odd: '-' }, { label: '', odd: '-' }]

                const winnerValues = winner ? [winner.home, winner.draw, winner.away] : ['-', '-', '-']

                const h1HandicapValues = h1Ah1 ? [
                  { label: h1Ah1.home.replace('Home ', ''), odd: h1Ah1.homeOdd },
                  { label: h1Ah1.away.replace('Away ', ''), odd: h1Ah1.awayOdd },
                ] : [{ label: '', odd: '-' }, { label: '', odd: '-' }]

                const h1OuLine = h1Ou ? (h1Ou.over.includes('0.5') ? '0.5' : '1.5') : '0.5'
                const h1OuValues = h1Ou ? [
                  { label: h1OuLine, odd: h1Ou.over },
                  { label: 'U', odd: h1Ou.under },
                ] : [{ label: '', odd: '-' }, { label: '', odd: '-' }]

                const h1WinnerValues = h1Winner ? [h1Winner.home, h1Winner.draw, h1Winner.away] : ['-', '-', '-']

                return (
                  <OddsMatchRow 
                    key={o.fixture.id} 
                    data={{
                      fixtureId: o.fixture.id,
                      fixtureDate: o.fixture.date,
                      homeTeam: teams?.home.name ?? 'Đội nhà',
                      awayTeam: teams?.away.name ?? 'Đội khách',
                      homeLogo: teams?.home.logo ?? '',
                      awayLogo: teams?.away.logo ?? '',
                      handicapValues,
                      ouValues,
                      winnerValues,
                      correctScore,
                      h1HandicapValues,
                      h1OuValues,
                      h1WinnerValues,
                    }}
                  />
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default async function TyLeKeoPage(props: PageProps<'/ty-le-keo'>) {
  const searchParams = await props.searchParams ?? {}
  const { league: leagueParam, bookmaker: bookmakerParam } = searchParams
  const selectedLeagueId = typeof leagueParam === 'string'
    ? parseInt(leagueParam)
    : TRACKED_LEAGUES[0].id

  const selectedBookmakerId = typeof bookmakerParam === 'string'
    ? parseInt(bookmakerParam)
    : 8 // Default: Bet365

  const selectedLeague = TRACKED_LEAGUES.find(l => l.id === selectedLeagueId) ?? TRACKED_LEAGUES[0]
  
  // Lấy danh sách bookmakers và nội dung - ưu tiên content có query params
  const [bookmakers, pageContentWithParams] = await Promise.all([
    getBookmakers(),
    getCurrentPageContent('/ty-le-keo', searchParams),
  ])
  const pageContentDefault = pageContentWithParams ? null : await getPageContent('odds')
  const oddsGuide = pageContentWithParams || pageContentDefault
  
  const selectedBookmaker = bookmakers.find(b => b.id === selectedBookmakerId) ?? { id: 8, name: 'Bet365' }

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 bg-green-700 px-4 py-3">
          <TrendingUp size={15} className="text-white" />
          <h1 className="text-sm font-semibold text-white">Tỷ lệ kèo</h1>
          <span className="ml-auto text-xs text-green-200">{selectedBookmaker.name}</span>
        </div>

        {/* Chọn bookmaker */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200">
          <span className="text-xs text-gray-600 font-medium">Nhà cái:</span>
          <BookmakerSelect 
            bookmakers={bookmakers} 
            selectedId={selectedBookmakerId}
            currentLeague={selectedLeagueId}
          />
        </div>

        {/* Tab chọn giải */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
          {TRACKED_LEAGUES.map((league) => {
            const isActive = league.id === selectedLeague.id
            return (
              <Link
                key={league.id}
                href={`/ty-le-keo?league=${league.id}&bookmaker=${selectedBookmakerId}`}
                className={`flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-b-2 border-green-700 text-green-700 bg-white'
                    : 'text-gray-500 hover:text-green-600'
                }`}
              >
                <div className="relative h-4 w-4 shrink-0">
                  <Image
                    src={`https://media.api-sports.io/football/leagues/${league.id}.png`}
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

        {/* Header bảng */}
        <div className="bg-gray-800 border-b border-gray-600">
          <div className="flex items-center text-white text-[10px] font-semibold">
            <div className="flex-1 px-3 py-2">Trận đấu</div>
            <div className="w-16 border-l border-gray-700 text-center py-2">Chấp</div>
            <div className="w-14 border-l border-gray-700 text-center py-2">T/X</div>
            <div className="w-12 border-l border-gray-700 text-center py-2">1×2</div>
            <div className="w-8 border-l border-gray-700"></div>
          </div>
        </div>

        {/* Danh sách kèo */}
        <Suspense fallback={<Skeleton />}>
          <OddsSection leagueId={selectedLeague.id} bookmakerId={selectedBookmakerId} />
        </Suspense>
      </div>

      {/* Hướng dẫn tỷ lệ kèo - di chuyển xuống cuối */}
      {oddsGuide && (
        <PageContentSection content={oddsGuide} />
      )}
    </div>
  )
}
