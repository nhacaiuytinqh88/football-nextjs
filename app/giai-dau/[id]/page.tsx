import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BarChart2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { getLeagueById, getLeagueRounds, getLeagueFixturesByRound } from '@/lib/services/league'
import { getStandings, CURRENT_SEASON } from '@/lib/services/standings'
import FixtureList from '@/components/ui/FixtureList'
import type { Standing } from '@/lib/api-football'

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

// Màu hàng BXH
function getRowColor(description: string | null): string {
  if (!description) return ''
  const d = description.toLowerCase()
  if (d.includes('champions league') || d.includes('promotion')) return 'border-l-2 border-blue-500'
  if (d.includes('europa league')) return 'border-l-2 border-orange-400'
  if (d.includes('conference')) return 'border-l-2 border-green-400'
  if (d.includes('relegation') || d.includes('xuống hạng')) return 'border-l-2 border-red-400'
  return ''
}

// BXH section
async function StandingsSection({ leagueId }: { leagueId: number }) {
  const standings = await getStandings(leagueId, CURRENT_SEASON)
  if (!standings || standings.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-gray-400">Chưa có dữ liệu BXH</p>
  }
  const table: Standing[] = standings[0]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100 text-gray-400">
            <th className="py-2 pl-3 text-left w-7">#</th>
            <th className="py-2 text-left">Đội</th>
            <th className="py-2 text-center w-7">Tr</th>
            <th className="py-2 text-center w-7">T</th>
            <th className="py-2 text-center w-7">H</th>
            <th className="py-2 text-center w-7">B</th>
            <th className="py-2 text-center w-10">HS</th>
            <th className="py-2 pr-3 text-center w-8 font-bold text-gray-600">Đ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {table.map((row) => (
            <tr key={row.team.id} className={`hover:bg-gray-50 ${getRowColor(row.description)}`}>
              <td className="py-2 pl-3 text-gray-500 font-medium">{row.rank}</td>
              <td className="py-2">
                <Link href={`/doi-bong/${row.team.id}?league=${leagueId}`} className="flex items-center gap-2 hover:text-green-700">
                  <div className="relative h-5 w-5 shrink-0">
                    <Image src={row.team.logo} alt={row.team.name} fill className="object-contain" sizes="20px" />
                  </div>
                  <span className="truncate max-w-[120px] font-medium text-gray-800">{row.team.name}</span>
                </Link>
              </td>
              <td className="py-2 text-center text-gray-600">{row.all.played}</td>
              <td className="py-2 text-center text-gray-600">{row.all.win}</td>
              <td className="py-2 text-center text-gray-600">{row.all.draw}</td>
              <td className="py-2 text-center text-gray-600">{row.all.lose}</td>
              <td className="py-2 text-center text-gray-500">
                {row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}
              </td>
              <td className="py-2 pr-3 text-center font-bold text-gray-900">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Chú thích */}
      <div className="flex flex-wrap gap-3 px-3 py-2 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <span className="h-2.5 w-1 rounded-sm bg-blue-500" />Champions League
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <span className="h-2.5 w-1 rounded-sm bg-orange-400" />Europa League
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
          <span className="h-2.5 w-1 rounded-sm bg-red-400" />Xuống hạng
        </div>
      </div>
    </div>
  )
}

// Lịch thi đấu theo vòng
async function FixturesSection({ leagueId, round }: { leagueId: number; round: string }) {
  const fixtures = await getLeagueFixturesByRound(leagueId, CURRENT_SEASON, round)
  return <FixtureList fixtures={fixtures} emptyMessage="Không có trận đấu nào trong vòng này" />
}

export default async function GiaiDauPage(props: PageProps<'/giai-dau/[id]'>) {
  const { id } = await props.params
  const { tab, round: roundParam } = await props.searchParams ?? {}
  const leagueId = parseInt(id)

  const [league, rounds] = await Promise.all([
    getLeagueById(leagueId),
    getLeagueRounds(leagueId, CURRENT_SEASON),
  ])

  if (!league) notFound()

  const activeTab = tab === 'lich' ? 'lich' : 'bxh'

  // Vòng đấu hiện tại: dùng param hoặc vòng cuối cùng trong danh sách
  const currentRound = typeof roundParam === 'string' ? roundParam : (rounds[rounds.length - 1] ?? '')
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
            <p className="text-xs text-gray-400">
              {league.country.flag && <span className="mr-1">{league.country.flag}</span>}
              {league.country.name} · Mùa {CURRENT_SEASON}
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
              <FixturesSection leagueId={leagueId} round={currentRound} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  )
}
