import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BarChart2 } from 'lucide-react'
import { getStandings, TRACKED_LEAGUES, CURRENT_SEASON } from '@/lib/services/standings'
import StandingsTable from '@/components/ui/StandingsTable'
import PageContentSection from '@/components/ui/PageContent'
import { getPageContent } from '@/lib/services/content'

export const metadata: Metadata = {
  title: 'Bảng xếp hạng bóng đá',
  description: 'Bảng xếp hạng các giải đấu bóng đá hàng đầu thế giới cập nhật mới nhất.',
}

function Skeleton() {
  return (
    <div className="px-3 py-2 space-y-1">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 py-2">
          <div className="h-4 w-6 animate-pulse rounded bg-gray-100" />
          <div className="h-5 w-5 animate-pulse rounded-full bg-gray-100" />
          <div className="h-3 flex-1 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
        </div>
      ))}
    </div>
  )
}

async function StandingsSection({ leagueId }: { leagueId: number }) {
  const standings = await getStandings(leagueId, CURRENT_SEASON)
  return <StandingsTable standings={standings} leagueId={leagueId} />
}

export default async function BangXepHangPage(props: PageProps<'/bang-xep-hang'>) {
  const { league: leagueParam } = await props.searchParams ?? {}
  const selectedLeagueId = typeof leagueParam === 'string'
    ? parseInt(leagueParam)
    : TRACKED_LEAGUES[0].id

  const selectedLeague = TRACKED_LEAGUES.find((l) => l.id === selectedLeagueId) ?? TRACKED_LEAGUES[0]
  
  // Lấy nội dung trang (nếu có)
  const pageContent = await getPageContent('standings')

  return (
    <div className="space-y-3">
      {/* Nội dung trang (nếu có) */}
      {pageContent && <PageContentSection content={pageContent} />}
      
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 bg-green-700 px-4 py-3">
          <BarChart2 size={15} className="text-white" />
          <h1 className="text-sm font-semibold text-white">Bảng xếp hạng</h1>
        </div>

        {/* Tab chọn giải - scrollable */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
          {TRACKED_LEAGUES.map((league) => {
            const isActive = league.id === selectedLeague.id
            return (
              <Link
                key={league.id}
                href={`/bang-xep-hang?league=${league.id}`}
                className={`shrink-0 px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-b-2 border-green-700 text-green-700'
                    : 'text-gray-500 hover:text-green-600'
                }`}
              >
                {league.name}
              </Link>
            )
          })}
        </div>

        {/* Bảng xếp hạng */}
        <Suspense fallback={<Skeleton />}>
          <StandingsSection leagueId={selectedLeague.id} />
        </Suspense>
      </div>
    </div>
  )
}
