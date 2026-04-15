import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Calendar, TrendingUp } from 'lucide-react'
import { getTeamById, getTeamStatistics, getTeamFixtures } from '@/lib/services/team'
import { CURRENT_SEASON, TRACKED_LEAGUES } from '@/lib/services/standings'
import FixtureList from '@/components/ui/FixtureList'

export async function generateMetadata(props: PageProps<'/doi-bong/[id]'>): Promise<Metadata> {
  const { id } = await props.params
  const team = await getTeamById(parseInt(id))
  if (!team) return { title: 'Đội bóng không tồn tại' }
  return {
    title: `${team.team.name} - Thông tin & Lịch thi đấu`,
    description: `Thông tin, thống kê và lịch thi đấu của ${team.team.name}.`,
  }
}

function Skeleton() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
      ))}
    </div>
  )
}

// Form 5 trận gần nhất
function FormBadge({ result }: { result: string }) {
  const colors: Record<string, string> = {
    W: 'bg-green-500 text-white',
    D: 'bg-gray-400 text-white',
    L: 'bg-red-500 text-white',
  }
  const labels: Record<string, string> = { W: 'T', D: 'H', L: 'B' }
  return (
    <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${colors[result] ?? 'bg-gray-200'}`}>
      {labels[result] ?? result}
    </span>
  )
}

// Thống kê đội — resolve season đúng theo giải
async function StatsSection({ teamId, leagueId }: { teamId: number; leagueId: number }) {
  const season = TRACKED_LEAGUES.find(l => l.id === leagueId)?.season ?? CURRENT_SEASON
  const stats = await getTeamStatistics(teamId, leagueId, season)
  if (!stats) {
    return <p className="px-4 py-6 text-center text-sm text-gray-400">Chưa có dữ liệu thống kê</p>
  }

  const form = stats.form.slice(-5).split('')
  const { fixtures, goals } = stats

  return (
    <div className="p-4 space-y-4">
      {/* Form 5 trận gần nhất */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Phong độ 5 trận gần nhất</p>
        <div className="flex gap-1.5">
          {form.map((r, i) => <FormBadge key={i} result={r} />)}
        </div>
      </div>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Thắng', value: fixtures.wins.total, color: 'text-green-600' },
          { label: 'Hòa', value: fixtures.draws.total, color: 'text-gray-500' },
          { label: 'Thua', value: fixtures.loses.total, color: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-lg bg-gray-50 p-3 text-center">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bàn thắng */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-xs text-gray-500 mb-1">Bàn thắng</p>
          <p className="text-lg font-bold text-green-700">{goals.for.total.total}</p>
          <p className="text-xs text-gray-400">TB {goals.for.average.total}/trận</p>
        </div>
        <div className="rounded-lg bg-red-50 p-3">
          <p className="text-xs text-gray-500 mb-1">Bàn thua</p>
          <p className="text-lg font-bold text-red-600">{goals.against.total.total}</p>
          <p className="text-xs text-gray-400">TB {goals.against.average.total}/trận</p>
        </div>
      </div>

      {/* Sân nhà vs Sân khách */}
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">Sân nhà / Sân khách</p>
        <div className="space-y-1.5 text-xs">
          {[
            { label: 'Trận đấu', home: fixtures.played.home, away: fixtures.played.away },
            { label: 'Thắng', home: fixtures.wins.home, away: fixtures.wins.away },
            { label: 'Bàn thắng', home: goals.for.total.home, away: goals.for.total.away },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span className="w-20 text-gray-400">{row.label}</span>
              <div className="flex flex-1 items-center gap-1">
                <span className="w-6 text-right font-medium text-gray-700">{row.home}</span>
                <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${(row.home / (row.home + row.away || 1)) * 100}%` }}
                  />
                </div>
                <span className="w-6 font-medium text-gray-700">{row.away}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Lịch thi đấu — resolve season đúng theo đội
async function FixturesSection({ teamId, leagueId }: { teamId: number; leagueId: number }) {
  const season = TRACKED_LEAGUES.find(l => l.id === leagueId)?.season ?? CURRENT_SEASON
  const { last, next } = await getTeamFixtures(teamId, season)

  return (
    <div className="space-y-4 p-4">
      {next.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Sắp thi đấu</p>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <FixtureList fixtures={next} showDate emptyMessage="" />
          </div>
        </div>
      )}
      {last.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Kết quả gần đây</p>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <FixtureList fixtures={[...last].reverse()} showDate emptyMessage="" />
          </div>
        </div>
      )}
      {next.length === 0 && last.length === 0 && (
        <p className="text-center text-sm text-gray-400 py-6">Không có dữ liệu lịch thi đấu</p>
      )}
    </div>
  )
}

export default async function DoiBongPage(props: PageProps<'/doi-bong/[id]'>) {
  const { id } = await props.params
  const { tab, league: leagueParam } = await props.searchParams ?? {}
  const teamId = parseInt(id)

  const team = await getTeamById(teamId)
  if (!team) notFound()

  const activeTab = tab === 'lich' ? 'lich' : 'thongke'

  // Ưu tiên leagueId từ param, fallback về Premier League
  const leagueId = typeof leagueParam === 'string' ? parseInt(leagueParam) : TRACKED_LEAGUES[0].id

  const { team: t, venue } = team

  return (
    <div className="space-y-4">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors">
        <ArrowLeft size={15} />
        Quay lại
      </Link>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Header đội bóng */}
        <div className="flex items-center gap-4 bg-gray-800 px-4 py-5">
          <div className="relative h-16 w-16 shrink-0">
            <Image src={t.logo} alt={t.name} fill className="object-contain" sizes="64px" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{t.name}</h1>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
              {t.country && (
                <span className="flex items-center gap-1">
                  <MapPin size={11} />
                  {t.country}
                </span>
              )}
              {t.founded && (
                <span className="flex items-center gap-1">
                  <Calendar size={11} />
                  Thành lập {t.founded}
                </span>
              )}
            </div>
            {venue.name && (
              <p className="mt-1 text-xs text-gray-400 truncate">
                🏟 {venue.name}{venue.city ? ` · ${venue.city}` : ''}
                {venue.capacity ? ` · ${venue.capacity.toLocaleString()} chỗ` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Tab chọn giải đấu (nếu có nhiều giải) */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
          {TRACKED_LEAGUES.map((l) => (
            <Link
              key={l.id}
              href={`/doi-bong/${id}?tab=${activeTab}&league=${l.id}`}
              className={`shrink-0 px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                leagueId === l.id
                  ? 'border-b-2 border-green-700 text-green-700'
                  : 'text-gray-400 hover:text-green-600'
              }`}
            >
              {l.name}
            </Link>
          ))}
        </div>

        {/* Tab Thống kê / Lịch thi đấu */}
        <div className="flex border-b border-gray-100">
          <Link
            href={`/doi-bong/${id}?tab=thongke&league=${leagueId}`}
            className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
              activeTab === 'thongke'
                ? 'border-b-2 border-green-700 text-green-700'
                : 'text-gray-500 hover:text-green-600'
            }`}
          >
            <TrendingUp size={14} className="inline mr-1.5 -mt-0.5" />
            Thống kê
          </Link>
          <Link
            href={`/doi-bong/${id}?tab=lich&league=${leagueId}`}
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

        {/* Nội dung */}
        {activeTab === 'thongke' ? (
          <Suspense fallback={<Skeleton />}>
            <StatsSection teamId={teamId} leagueId={leagueId} />
          </Suspense>
        ) : (
          <Suspense fallback={<Skeleton />}>
            <FixturesSection teamId={teamId} leagueId={leagueId} />
          </Suspense>
        )}
      </div>
    </div>
  )
}
