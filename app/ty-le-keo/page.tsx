import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TrendingUp, ChevronRight } from 'lucide-react'
import { getOddsByLeague, getMatchWinner, getOverUnder, getAsianHandicap } from '@/lib/services/odds'
import { TRACKED_LEAGUES } from '@/lib/services/standings'
import { formatMatchDateTime } from '@/lib/date'
import type { FixtureOdds } from '@/lib/api-football'

export const metadata: Metadata = {
  title: 'Tỷ lệ kèo bóng đá',
  description: 'Tỷ lệ kèo bóng đá cập nhật từ Bet365 - kèo 1x2, châu Á, tài xỉu các giải hàng đầu.',
}

// Skeleton
function Skeleton() {
  return (
    <div className="space-y-2 p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-100" />
      ))}
    </div>
  )
}

// Component 1 hàng kèo
function OddsRow({ odds, type }: { odds: FixtureOdds; type: 'all' | 'compact' }) {
  const winner = getMatchWinner(odds)
  const ou = getOverUnder(odds, '2.5')
  const ah = getAsianHandicap(odds)

  if (!winner) return null

  // Màu odds: thấp = xanh (cửa trên), cao = đỏ (cửa dưới)
  const colorOdd = (odd: string) => {
    const v = parseFloat(odd)
    if (isNaN(v) || odd === '-') return 'text-gray-700'
    if (v < 1.5) return 'text-green-700 font-bold'
    if (v < 2.0) return 'text-green-600'
    if (v > 3.5) return 'text-red-500'
    return 'text-gray-800'
  }

  return (
    <Link
      href={`/tran-dau/${odds.fixture.id}`}
      className="block px-4 py-3 hover:bg-gray-50 transition-colors"
    >
      {/* Giờ đấu */}
      <p className="text-[10px] text-gray-400 mb-2">{formatMatchDateTime(odds.fixture.date)}</p>

      {/* Kèo 1x2 */}
      <div className="mb-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Kèo 1X2</p>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: '1 (Nhà)', odd: winner.home },
            { label: 'X (Hòa)', odd: winner.draw },
            { label: '2 (Khách)', odd: winner.away },
          ].map(({ label, odd }) => (
            <div key={label} className="rounded-lg bg-gray-50 px-2 py-1.5 text-center">
              <p className="text-[10px] text-gray-400">{label}</p>
              <p className={`text-sm tabular-nums ${colorOdd(odd)}`}>{odd}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Kèo châu Á + Tài xỉu — 2 cột */}
      <div className="grid grid-cols-2 gap-3">
        {/* Châu Á */}
        {ah.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Kèo châu Á</p>
            <div className="space-y-1">
              {ah.slice(0, 2).map((row, i) => (
                <div key={i} className="grid grid-cols-2 gap-1">
                  <div className="rounded bg-gray-50 px-1.5 py-1 text-center">
                    <p className="text-[9px] text-gray-400 truncate">{row.home.replace('Home ', '')}</p>
                    <p className={`text-xs tabular-nums ${colorOdd(row.homeOdd)}`}>{row.homeOdd}</p>
                  </div>
                  <div className="rounded bg-gray-50 px-1.5 py-1 text-center">
                    <p className="text-[9px] text-gray-400 truncate">{row.away.replace('Away ', '')}</p>
                    <p className={`text-xs tabular-nums ${colorOdd(row.awayOdd)}`}>{row.awayOdd}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tài xỉu */}
        {ou && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Tài/Xỉu 2.5</p>
            <div className="grid grid-cols-2 gap-1">
              <div className="rounded bg-orange-50 px-1.5 py-1 text-center">
                <p className="text-[9px] text-orange-500">Tài</p>
                <p className={`text-xs tabular-nums ${colorOdd(ou.over)}`}>{ou.over}</p>
              </div>
              <div className="rounded bg-blue-50 px-1.5 py-1 text-center">
                <p className="text-[9px] text-blue-500">Xỉu</p>
                <p className={`text-xs tabular-nums ${colorOdd(ou.under)}`}>{ou.under}</p>
              </div>
            </div>
            {/* Thêm dòng 1.5 */}
            {(() => {
              const ou15 = getOverUnder({ ...odds }, '1.5')
              if (!ou15) return null
              return (
                <div className="grid grid-cols-2 gap-1 mt-1">
                  <div className="rounded bg-orange-50 px-1.5 py-1 text-center">
                    <p className="text-[9px] text-orange-500">Tài 1.5</p>
                    <p className={`text-xs tabular-nums ${colorOdd(ou15.over)}`}>{ou15.over}</p>
                  </div>
                  <div className="rounded bg-blue-50 px-1.5 py-1 text-center">
                    <p className="text-[9px] text-blue-500">Xỉu 1.5</p>
                    <p className={`text-xs tabular-nums ${colorOdd(ou15.under)}`}>{ou15.under}</p>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-gray-400">
        <span>Xem chi tiết trận</span>
        <ChevronRight size={11} />
      </div>
    </Link>
  )
}

// Header nhóm theo giải
function LeagueHeader({ odds }: { odds: FixtureOdds }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 border-b border-gray-100">
      <div className="relative h-4 w-4 shrink-0">
        <Image src={odds.league.logo} alt={odds.league.name} fill className="object-contain" sizes="16px" />
      </div>
      <span className="text-xs font-semibold text-gray-600">
        {odds.league.country} · {odds.league.name}
      </span>
    </div>
  )
}

// Section kèo theo giải
async function OddsSection({ leagueId }: { leagueId: number }) {
  const { odds } = await getOddsByLeague(leagueId)

  if (odds.length === 0) {
    return (
      <div className="px-4 py-6 text-center text-sm text-gray-400">
        Chưa có tỷ lệ kèo cho giải này
      </div>
    )
  }

  // Nhóm theo giải (thường chỉ 1 giải)
  const grouped = odds.reduce<Record<number, FixtureOdds[]>>((acc, o) => {
    const lid = o.league.id
    if (!acc[lid]) acc[lid] = []
    acc[lid].push(o)
    return acc
  }, {})

  return (
    <div>
      {Object.values(grouped).map((group) => (
        <div key={group[0].league.id}>
          <LeagueHeader odds={group[0]} />
          <div className="divide-y divide-gray-50">
            {group.map((o) => (
              <OddsRow key={o.fixture.id} odds={o} type="all" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function TyLeKeoPage(props: PageProps<'/ty-le-keo'>) {
  const { league: leagueParam } = await props.searchParams ?? {}
  const selectedLeagueId = typeof leagueParam === 'string'
    ? parseInt(leagueParam)
    : TRACKED_LEAGUES[0].id

  const selectedLeague = TRACKED_LEAGUES.find(l => l.id === selectedLeagueId) ?? TRACKED_LEAGUES[0]

  return (
    <div className="space-y-3">
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 bg-green-700 px-4 py-3">
          <TrendingUp size={15} className="text-white" />
          <h1 className="text-sm font-semibold text-white">Tỷ lệ kèo</h1>
          <span className="ml-auto text-xs text-green-200">Bet365</span>
        </div>

        {/* Tab chọn giải */}
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
          {TRACKED_LEAGUES.map((league) => {
            const isActive = league.id === selectedLeague.id
            return (
              <Link
                key={league.id}
                href={`/ty-le-keo?league=${league.id}`}
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

        {/* Chú thích màu odds */}
        <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="font-bold text-green-700">1.xx</span> Cửa trên</span>
          <span className="flex items-center gap-1"><span className="text-gray-800">2.xx</span> Cân bằng</span>
          <span className="flex items-center gap-1"><span className="text-red-500">3.xx+</span> Cửa dưới</span>
        </div>

        {/* Danh sách kèo */}
        <Suspense fallback={<Skeleton />}>
          <OddsSection leagueId={selectedLeague.id} />
        </Suspense>
      </div>
    </div>
  )
}
