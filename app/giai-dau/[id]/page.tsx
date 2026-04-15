import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BarChart2, Calendar, ChevronLeft, ChevronRight, Globe } from 'lucide-react'
import { getLeagueById, getLeagueRounds, getLeagueFixturesByRound, getCurrentRound } from '@/lib/services/league'
import { getStandings, CURRENT_SEASON, TRACKED_LEAGUES } from '@/lib/services/standings'
import FixtureList from '@/components/ui/FixtureList'
import StandingsTable from '@/components/ui/StandingsTable'

export async function generateMetadata(props: PageProps<'/giai-dau/[id]'>): Promise<Metadata> {
  const { id } = await props.params
  const league = await getLeagueById(parseInt(id))
  if (!league) return { title: 'Giải đấu không tồn tại' }
  return {
    title: `${league.league.name} - Bảng xếp hạng & Lịch thi đấu`,
    description: `Bảng xếp hạng, lịch thi đấu và kết quả ${league.league.name} ${CURRENT_SEASON}.`,
  }
}

// Skeleton
function Skeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-10 animate-pulse rounded bg-gray-100" />
      ))}
    </div>
  )
}

// BXH section — không truyền season, để service tự resolve đúng theo từng giải
async function StandingsSection({ leagueId }: { leagueId: number }) {
  const standings = await getStandings(leagueId)
  return <StandingsTable standings={standings} leagueId={leagueId} />
}

// Lịch thi đấu theo vòng
async function FixturesSection({ leagueId, season, round }: { leagueId: number; season: number; round: string }) {
  const fixtures = await getLeagueFixturesByRound(leagueId, season, round)
  return <FixtureList fixtures={fixtures} showDate emptyMessage="Không có trận đấu nào trong vòng này" />
}

export default async function GiaiDauPage(props: PageProps<'/giai-dau/[id]'>) {
  const { id } = await props.params
  const { tab, round: roundParam } = await props.searchParams ?? {}
  const leagueId = parseInt(id)

  const [league, rounds] = await Promise.all([
    getLeagueById(leagueId),
    getLeagueRounds(leagueId, TRACKED_LEAGUES.find(l => l.id === leagueId)?.season ?? CURRENT_SEASON),
  ])

  if (!league) notFound()

  const activeTab = tab === 'lich' ? 'lich' : 'bxh'

  // Resolve đúng season cho từng giải (V.League = 2026, châu Âu = 2025)
  const leagueSeason = TRACKED_LEAGUES.find(l => l.id === leagueId)?.season ?? CURRENT_SEASON

  // Vòng hiện tại: dùng param URL nếu có, không thì tự tìm vòng đang diễn ra
  const currentRound = typeof roundParam === 'string' && roundParam
    ? roundParam
    : await getCurrentRound(leagueId, leagueSeason, rounds)

  const currentRoundIndex = rounds.indexOf(currentRound)
  const prevRound = currentRoundIndex > 0 ? rounds[currentRoundIndex - 1] : null
  const nextRound = currentRoundIndex < rounds.length - 1 ? rounds[currentRoundIndex + 1] : null

  // Tên vòng rút gọn để hiển thị
  const shortRound = currentRound.replace('Regular Season - ', 'Vòng ')

  return (
    <div className="space-y-4">
      {/* Header giải đấu */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 bg-gray-800 px-4 py-4">
          <div className="relative h-12 w-12 shrink-0">
            <Image src={league.league.logo} alt={league.league.name} fill className="object-contain" sizes="48px" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">{league.league.name}</h1>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Globe size={11} />
              {league.country.name} · Mùa {leagueSeason}
            </p>
          </div>
        </div>

        {/* Tab BXH / Lịch thi đấu */}
        <div className="flex border-b border-gray-100">
          <Link
            href={`/giai-dau/${id}?tab=bxh`}
            className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
              activeTab === 'bxh'
                ? 'border-b-2 border-green-700 text-green-700'
                : 'text-gray-500 hover:text-green-600'
            }`}
          >
            <BarChart2 size={14} className="inline mr-1.5 -mt-0.5" />
            Bảng xếp hạng
          </Link>
          <Link
            href={`/giai-dau/${id}?tab=lich&round=${encodeURIComponent(currentRound)}`}
            className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
              activeTab === 'lich'
                ? 'border-b-2 border-green-700 text-green-700'
                : 'text-gray-500 hover:text-green-600'
            }`}
          >
            <Calendar size={14} className="inline mr-1.5 -mt-0.5" />
            Lịch thi đấu
          </Link>
        </div>

        {/* Nội dung tab */}
        {activeTab === 'bxh' ? (
          <Suspense fallback={<Skeleton />}>
            <StandingsSection leagueId={leagueId} />
          </Suspense>
        ) : (
          <>
            {/* Round navigator */}
            {rounds.length > 0 && (
              <div className="flex items-center justify-between border-b border-gray-100 px-2 py-2">
                <Link
                  href={prevRound ? `/giai-dau/${id}?tab=lich&round=${encodeURIComponent(prevRound)}` : '#'}
                  className={`rounded-lg p-1.5 transition-colors ${prevRound ? 'text-gray-500 hover:bg-gray-100' : 'pointer-events-none text-gray-200'}`}
                >
                  <ChevronLeft size={18} />
                </Link>
                <span className="text-sm font-medium text-gray-700">{shortRound}</span>
                <Link
                  href={nextRound ? `/giai-dau/${id}?tab=lich&round=${encodeURIComponent(nextRound)}` : '#'}
                  className={`rounded-lg p-1.5 transition-colors ${nextRound ? 'text-gray-500 hover:bg-gray-100' : 'pointer-events-none text-gray-200'}`}
                >
                  <ChevronRight size={18} />
                </Link>
              </div>
            )}
            <Suspense fallback={<Skeleton />}>
              <FixturesSection leagueId={leagueId} season={leagueSeason} round={currentRound} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  )
}
