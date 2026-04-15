import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MapPin, Calendar, TrendingUp, Users } from 'lucide-react'
import { getTeamById, getTeamStatistics, getTeamFixtures, getTeamLeagues } from '@/lib/services/team'
import { TRACKED_LEAGUES } from '@/lib/services/standings'
import FixtureList from '@/components/ui/FixtureList'
import BackButton from '@/components/ui/BackButton'
import PageContentSection from '@/components/ui/PageContent'
import { getTeamContent } from '@/lib/services/content'

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
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse rounded-lg bg-gray-100" />
      ))}
    </div>
  )
}

function FormBadge({ result }: { result: string }) {
  const styles: Record<string, string> = {
    W: 'bg-green-500 text-white',
    D: 'bg-gray-300 text-gray-700',
    L: 'bg-red-500 text-white',
  }
  const labels: Record<string, string> = { W: 'T', D: 'H', L: 'B' }
  return (
    <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${styles[result] ?? 'bg-gray-200'}`}>
      {labels[result] ?? result}
    </span>
  )
}

// Thống kê đội
async function StatsSection({ teamId, leagueId, season }: { teamId: number; leagueId: number; season: number }) {
  const stats = await getTeamStatistics(teamId, leagueId, season)

  if (!stats) {
    return (
      <div className="px-4 py-10 text-center text-sm text-gray-400">
        Chưa có dữ liệu thống kê cho giải này
      </div>
    )
  }

  const form = (stats.form ?? '').slice(-5).split('').filter(Boolean)
  const { fixtures, goals, biggest, clean_sheet, failed_to_score } = stats

  return (
    <div className="p-4 space-y-5">
      {/* Form gần nhất */}
      {form.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Phong độ {form.length} trận gần nhất
          </p>
          <div className="flex gap-1.5">
            {form.map((r, i) => <FormBadge key={i} result={r} />)}
          </div>
        </div>
      )}

      {/* Tổng quan W/D/L */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Tổng quan ({fixtures.played.total} trận)
        </p>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Thắng', value: fixtures.wins.total, pct: Math.round(fixtures.wins.total / (fixtures.played.total || 1) * 100), color: 'bg-green-500' },
            { label: 'Hòa', value: fixtures.draws.total, pct: Math.round(fixtures.draws.total / (fixtures.played.total || 1) * 100), color: 'bg-gray-300' },
            { label: 'Thua', value: fixtures.loses.total, pct: Math.round(fixtures.loses.total / (fixtures.played.total || 1) * 100), color: 'bg-red-400' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl bg-gray-50 p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              <div className="mt-2 h-1 rounded-full bg-gray-200 overflow-hidden">
                <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{s.pct}%</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bàn thắng / thua */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-green-50 p-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">Bàn thắng</p>
          <p className="text-2xl font-bold text-green-700">{goals.for.total.total}</p>
          <p className="text-xs text-gray-400">TB {goals.for.average.total}/trận</p>
          <div className="mt-2 flex justify-between text-[10px] text-gray-400">
            <span>Nhà: {goals.for.total.home}</span>
            <span>Khách: {goals.for.total.away}</span>
          </div>
        </div>
        <div className="rounded-xl bg-red-50 p-3">
          <p className="text-xs font-semibold text-gray-500 mb-1">Bàn thua</p>
          <p className="text-2xl font-bold text-red-600">{goals.against.total.total}</p>
          <p className="text-xs text-gray-400">TB {goals.against.average.total}/trận</p>
          <div className="mt-2 flex justify-between text-[10px] text-gray-400">
            <span>Nhà: {goals.against.total.home}</span>
            <span>Khách: {goals.against.total.away}</span>
          </div>
        </div>
      </div>

      {/* Sân nhà vs Sân khách */}
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Sân nhà / Sân khách
        </p>
        <div className="space-y-2">
          {[
            { label: 'Trận đấu', home: fixtures.played.home, away: fixtures.played.away },
            { label: 'Thắng', home: fixtures.wins.home, away: fixtures.wins.away },
            { label: 'Bàn thắng', home: goals.for.total.home, away: goals.for.total.away },
            { label: 'Bàn thua', home: goals.against.total.home, away: goals.against.total.away },
          ].map((row) => {
            const total = row.home + row.away || 1
            const homePct = (row.home / total) * 100
            return (
              <div key={row.label} className="flex items-center gap-2 text-xs">
                <span className="w-20 shrink-0 text-gray-400">{row.label}</span>
                <span className="w-5 text-right font-semibold text-gray-700">{row.home}</span>
                <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${homePct}%` }} />
                </div>
                <span className="w-5 font-semibold text-gray-700">{row.away}</span>
              </div>
            )
          })}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-gray-400 px-[88px]">
          <span>Nhà</span>
          <span>Khách</span>
        </div>
      </div>

      {/* Thêm thống kê */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-400 mb-1">Giữ sạch lưới</p>
          <p className="text-xl font-bold text-gray-800">{clean_sheet.total}</p>
          <p className="text-[10px] text-gray-400">Nhà: {clean_sheet.home} · Khách: {clean_sheet.away}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs text-gray-400 mb-1">Không ghi bàn</p>
          <p className="text-xl font-bold text-gray-800">{failed_to_score.total}</p>
          <p className="text-[10px] text-gray-400">Nhà: {failed_to_score.home} · Khách: {failed_to_score.away}</p>
        </div>
      </div>

      {/* Thắng/thua lớn nhất */}
      {(biggest.wins.home || biggest.wins.away || biggest.loses.home || biggest.loses.away) && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Kết quả đáng nhớ</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {biggest.wins.home && (
              <div className="rounded-xl bg-green-50 p-3">
                <p className="text-[10px] text-gray-400 mb-1">Thắng lớn nhất (sân nhà)</p>
                <p className="font-bold text-green-700">{biggest.wins.home}</p>
              </div>
            )}
            {biggest.wins.away && (
              <div className="rounded-xl bg-green-50 p-3">
                <p className="text-[10px] text-gray-400 mb-1">Thắng lớn nhất (sân khách)</p>
                <p className="font-bold text-green-700">{biggest.wins.away}</p>
              </div>
            )}
            {biggest.loses.home && (
              <div className="rounded-xl bg-red-50 p-3">
                <p className="text-[10px] text-gray-400 mb-1">Thua nặng nhất (sân nhà)</p>
                <p className="font-bold text-red-600">{biggest.loses.home}</p>
              </div>
            )}
            {biggest.loses.away && (
              <div className="rounded-xl bg-red-50 p-3">
                <p className="text-[10px] text-gray-400 mb-1">Thua nặng nhất (sân khách)</p>
                <p className="font-bold text-red-600">{biggest.loses.away}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Lịch thi đấu
async function FixturesSection({ teamId, season }: { teamId: number; season: number }) {
  const { last, next } = await getTeamFixtures(teamId, season)

  return (
    <div className="space-y-4 p-4">
      {next.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sắp thi đấu</p>
          <div className="rounded-xl border border-gray-100 overflow-hidden">
            <FixtureList fixtures={next} showDate emptyMessage="" />
          </div>
        </div>
      )}
      {last.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Kết quả gần đây</p>
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

  const { team: t, venue } = team
  const activeTab = tab === 'lich' ? 'lich' : 'thongke'

  // Lấy giải đấu thực tế của đội — thử season 2025 trước, fallback 2026
  let teamLeagues = await getTeamLeagues(teamId, 2025)
  if (teamLeagues.length === 0) {
    teamLeagues = await getTeamLeagues(teamId, 2026)
  }

  // Lọc chỉ giữ các giải có trong TRACKED_LEAGUES hoặc tất cả nếu không có
  const trackedIds = TRACKED_LEAGUES.map(l => l.id) as number[]
  const filteredLeagues = teamLeagues.filter(l => trackedIds.includes(l.id))
  const displayLeagues = filteredLeagues.length > 0 ? filteredLeagues : teamLeagues.slice(0, 4)

  // Resolve leagueId từ param hoặc giải đầu tiên của đội
  const defaultLeagueId = displayLeagues[0]?.id ?? TRACKED_LEAGUES[0].id
  const leagueId = typeof leagueParam === 'string' ? parseInt(leagueParam) : defaultLeagueId

  // Resolve season đúng cho giải đó
  const trackedLeague = TRACKED_LEAGUES.find(l => l.id === leagueId)
  const season = trackedLeague?.season ?? (teamLeagues.length > 0 ? 2025 : 2026)

  // Lấy nội dung giới thiệu đội bóng
  const teamContent = await getTeamContent(teamId)

  return (
    <div className="space-y-4">
      <BackButton />

      {/* Nội dung giới thiệu đội bóng */}
      {teamContent && (
        <PageContentSection content={teamContent} />
      )}

      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-4 bg-gray-800 px-4 py-5">
          <div className="relative h-16 w-16 shrink-0">
            <Image src={t.logo} alt={t.name} fill className="object-contain" sizes="64px" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-white truncate">{t.name}</h1>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
              {t.country && (
                <span className="flex items-center gap-1"><MapPin size={11} />{t.country}</span>
              )}
              {t.founded && (
                <span className="flex items-center gap-1"><Calendar size={11} />Thành lập {t.founded}</span>
              )}
            </div>
            {venue.name && (
              <p className="mt-1 text-xs text-gray-400 truncate">
                <Users size={11} className="inline mr-1" />
                {venue.name}{venue.city ? ` · ${venue.city}` : ''}
                {venue.capacity ? ` · ${venue.capacity.toLocaleString()} chỗ` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Tab chọn giải — chỉ hiện giải đấu thực tế của đội */}
        {displayLeagues.length > 1 && (
          <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100 bg-gray-50">
            {displayLeagues.map((l) => (
              <Link
                key={l.id}
                href={`/doi-bong/${id}?tab=${activeTab}&league=${l.id}`}
                className={`flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors ${
                  leagueId === l.id
                    ? 'border-b-2 border-green-700 text-green-700 bg-white'
                    : 'text-gray-500 hover:text-green-600'
                }`}
              >
                <div className="relative h-4 w-4 shrink-0">
                  <Image src={l.logo} alt={l.name} fill className="object-contain" sizes="16px" />
                </div>
                {l.name}
              </Link>
            ))}
          </div>
        )}

        {/* Tab Thống kê / Lịch */}
        <div className="flex border-b border-gray-100">
          <Link
            href={`/doi-bong/${id}?tab=thongke&league=${leagueId}`}
            className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
              activeTab === 'thongke' ? 'border-b-2 border-green-700 text-green-700' : 'text-gray-500 hover:text-green-600'
            }`}
          >
            <TrendingUp size={14} className="inline mr-1.5 -mt-0.5" />
            Thống kê
          </Link>
          <Link
            href={`/doi-bong/${id}?tab=lich&league=${leagueId}`}
            className={`flex-1 py-2.5 text-center text-sm font-medium transition-colors ${
              activeTab === 'lich' ? 'border-b-2 border-green-700 text-green-700' : 'text-gray-500 hover:text-green-600'
            }`}
          >
            <Calendar size={14} className="inline mr-1.5 -mt-0.5" />
            Lịch thi đấu
          </Link>
        </div>

        <Suspense fallback={<Skeleton />}>
          {activeTab === 'thongke'
            ? <StatsSection teamId={teamId} leagueId={leagueId} season={season} />
            : <FixturesSection teamId={teamId} season={season} />
          }
        </Suspense>
      </div>
    </div>
  )
}
