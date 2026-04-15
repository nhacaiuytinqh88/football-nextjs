import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock, Users, TrendingUp } from 'lucide-react'
import { getFixtureDetails } from '@/lib/services/fixtures'
import { getOddsByFixture, getMatchWinner, getOverUnder, getAsianHandicap } from '@/lib/services/odds'
import { supabase } from '@/lib/supabase'
import MatchStatusBadge from '@/components/ui/MatchStatusBadge'
import { fixtureJsonLd } from '@/lib/json-ld'
import { formatMatchDateTime, formatArticleDate } from '@/lib/date'
import type { FixtureDetail, FixtureEvent } from '@/lib/api-football'

export async function generateMetadata(props: PageProps<'/tran-dau/[id]'>): Promise<Metadata> {
  const { id } = await props.params
  const fixture = await getFixtureDetails(parseInt(id))
  if (!fixture) return { title: 'Trận đấu không tồn tại' }
  const { teams, goals, fixture: f, league } = fixture
  const score = `${goals.home ?? '?'} - ${goals.away ?? '?'}`
  const title = `${teams.home.name} ${score} ${teams.away.name} | ${league.name}`
  return {
    title,
    description: `Kết quả và thông tin chi tiết trận ${teams.home.name} vs ${teams.away.name} - ${league.name}`,
    openGraph: { title, images: [teams.home.logo, teams.away.logo] },
  }
}

function Skeleton() {
  return <div className="h-40 animate-pulse rounded-xl bg-gray-200" />
}

// --- Scoreboard ---
function Scoreboard({ fixture }: { fixture: FixtureDetail }) {
  const { fixture: f, teams, goals, score, league } = fixture
  const isLive = ['1H', '2H', 'HT', 'ET', 'BT', 'P'].includes(f.status.short)

  return (
    <div className={`rounded-xl shadow-sm overflow-hidden ${isLive ? 'bg-green-700' : 'bg-gray-800'}`}>
      {/* League */}
      <div className="flex items-center gap-2 px-4 py-2 bg-black/20">
        <div className="relative h-4 w-4 shrink-0">
          <Image src={league.logo} alt={league.name} fill className="object-contain" sizes="16px" />
        </div>
        <span className="text-xs text-white/80">{league.country} · {league.name}</span>
        <span className="ml-auto text-xs text-white/60">{league.round}</span>
      </div>

      {/* Teams + Score */}
      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex flex-col items-center gap-2 flex-1">
          <Link href={`/doi-bong/${teams.home.id}`}>
            <div className="relative h-14 w-14">
              <Image src={teams.home.logo} alt={teams.home.name} fill className="object-contain" sizes="56px" />
            </div>
          </Link>
          <span className="text-sm font-semibold text-white text-center leading-tight max-w-[90px]">
            {teams.home.name}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 px-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl font-bold text-white tabular-nums">{goals.home ?? '-'}</span>
            <span className="text-2xl text-white/40">:</span>
            <span className="text-4xl font-bold text-white tabular-nums">{goals.away ?? '-'}</span>
          </div>
          <MatchStatusBadge status={f.status.short} elapsed={f.status.elapsed} date={f.date} />
          {score.halftime.home !== null && (
            <span className="text-xs text-white/50">HT: {score.halftime.home} - {score.halftime.away}</span>
          )}
          {score.penalty.home !== null && (
            <span className="text-xs text-yellow-300">Pen: {score.penalty.home} - {score.penalty.away}</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          <Link href={`/doi-bong/${teams.away.id}`}>
            <div className="relative h-14 w-14">
              <Image src={teams.away.logo} alt={teams.away.name} fill className="object-contain" sizes="56px" />
            </div>
          </Link>
          <span className="text-sm font-semibold text-white text-center leading-tight max-w-[90px]">
            {teams.away.name}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center justify-center gap-4 px-4 py-2 bg-black/20 text-xs text-white/60">
        <span className="flex items-center gap-1"><Clock size={11} />{formatMatchDateTime(f.date)}</span>
        {f.referee && <span>🏳 {f.referee}</span>}
      </div>
    </div>
  )
}

// --- Events (bàn thắng, thẻ phạt) ---
function EventIcon({ event }: { event: FixtureEvent }) {
  if (event.type === 'Goal') {
    if (event.detail === 'Own Goal') return <span title="Phản lưới">⚽🔴</span>
    if (event.detail === 'Penalty') return <span title="Penalty">⚽🎯</span>
    return <span title="Bàn thắng">⚽</span>
  }
  if (event.type === 'Card') {
    if (event.detail === 'Yellow Card') return <span className="inline-block h-3.5 w-2.5 rounded-sm bg-yellow-400" title="Thẻ vàng" />
    if (event.detail === 'Red Card') return <span className="inline-block h-3.5 w-2.5 rounded-sm bg-red-600" title="Thẻ đỏ" />
    if (event.detail === 'Yellow Red Card') return <span className="inline-block h-3.5 w-2.5 rounded-sm bg-orange-500" title="Thẻ vàng thứ 2" />
  }
  if (event.type === 'subst') return <span title="Thay người">🔄</span>
  if (event.type === 'Var') return <span title="VAR">📺</span>
  return null
}

function EventsSection({ fixture }: { fixture: FixtureDetail }) {
  const events = fixture.events ?? []
  if (events.length === 0) return null

  // Chỉ hiện bàn thắng và thẻ phạt (bỏ thay người để gọn)
  const keyEvents = events.filter(e => e.type === 'Goal' || e.type === 'Card' || e.type === 'Var')
  if (keyEvents.length === 0) return null

  const homeId = fixture.teams.home.id

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">Diễn biến trận đấu</h2>
      </div>
      <div className="divide-y divide-gray-50">
        {keyEvents.map((event, idx) => {
          const isHome = event.team.id === homeId
          return (
            <div key={idx} className={`flex items-center gap-3 px-4 py-2.5 ${isHome ? '' : 'flex-row-reverse'}`}>
              {/* Phút */}
              <span className="w-8 shrink-0 text-center text-xs font-bold text-gray-500 tabular-nums">
                {event.time.elapsed}{event.time.extra ? `+${event.time.extra}` : ''}&apos;
              </span>

              {/* Icon */}
              <div className="shrink-0 text-sm">
                <EventIcon event={event} />
              </div>

              {/* Tên cầu thủ */}
              <div className={`flex-1 min-w-0 ${isHome ? '' : 'text-right'}`}>
                <p className="text-xs font-medium text-gray-800 truncate">{event.player.name}</p>
                {event.assist.name && event.type === 'Goal' && (
                  <p className="text-[10px] text-gray-400 truncate">Kiến tạo: {event.assist.name}</p>
                )}
                {event.type === 'subst' && event.assist.name && (
                  <p className="text-[10px] text-gray-400 truncate">Vào: {event.assist.name}</p>
                )}
              </div>

              {/* Logo đội */}
              <div className="relative h-5 w-5 shrink-0">
                <Image src={event.team.logo} alt={event.team.name} fill className="object-contain" sizes="20px" />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// --- Statistics ---
function StatBar({ label, home, away }: { label: string; home: number | string | null; away: number | string | null }) {
  const h = typeof home === 'string' ? parseFloat(home) : (home ?? 0)
  const a = typeof away === 'string' ? parseFloat(away) : (away ?? 0)
  const total = h + a || 1
  const homePct = (h / total) * 100

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-semibold text-gray-800">{home ?? 0}</span>
        <span className="text-gray-400 text-[11px]">{label}</span>
        <span className="font-semibold text-gray-800">{away ?? 0}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-100">
        <div className="bg-green-500 rounded-l-full" style={{ width: `${homePct}%` }} />
        <div className="bg-blue-400 rounded-r-full flex-1" />
      </div>
    </div>
  )
}

const STAT_LABELS: Record<string, string> = {
  'Shots on Goal': 'Sút trúng đích',
  'Shots off Goal': 'Sút trượt',
  'Total Shots': 'Tổng số cú sút',
  'Blocked Shots': 'Sút bị chặn',
  'Shots insidebox': 'Sút trong vòng cấm',
  'Shots outsidebox': 'Sút ngoài vòng cấm',
  'Fouls': 'Phạm lỗi',
  'Corner Kicks': 'Phạt góc',
  'Offsides': 'Việt vị',
  'Ball Possession': 'Kiểm soát bóng',
  'Yellow Cards': 'Thẻ vàng',
  'Red Cards': 'Thẻ đỏ',
  'Goalkeeper Saves': 'Cứu thua',
  'Total passes': 'Tổng đường chuyền',
  'Passes accurate': 'Chuyền chính xác',
  'Passes %': 'Tỷ lệ chuyền',
  'expected_goals': 'xG (Bàn thắng kỳ vọng)',
}

function StatisticsSection({ fixture }: { fixture: FixtureDetail }) {
  const stats = fixture.statistics ?? []
  if (stats.length < 2) return null

  const [home, away] = stats
  const homeStats = Object.fromEntries(home.statistics.map(s => [s.type, s.value]))
  const awayStats = Object.fromEntries(away.statistics.map(s => [s.type, s.value]))

  const statKeys = home.statistics.map(s => s.type)

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="relative h-5 w-5">
            <Image src={home.team.logo} alt={home.team.name} fill className="object-contain" sizes="20px" />
          </div>
          <span className="text-xs font-semibold text-green-700">{home.team.name}</span>
        </div>
        <span className="text-xs font-semibold text-gray-500">Thống kê</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-blue-600">{away.team.name}</span>
          <div className="relative h-5 w-5">
            <Image src={away.team.logo} alt={away.team.name} fill className="object-contain" sizes="20px" />
          </div>
        </div>
      </div>
      <div className="px-4 py-3 space-y-3">
        {statKeys.map((key) => (
          <StatBar
            key={key}
            label={STAT_LABELS[key] ?? key}
            home={homeStats[key]}
            away={awayStats[key]}
          />
        ))}
      </div>
    </div>
  )
}

// --- Lineups ---
function LineupsSection({ fixture }: { fixture: FixtureDetail }) {
  const lineups = fixture.lineups ?? []
  if (lineups.length < 2) return null

  const [home, away] = lineups

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-800">Đội hình ra sân</h2>
      </div>
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        {[home, away].map((lineup, idx) => (
          <div key={idx} className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative h-5 w-5 shrink-0">
                <Image src={lineup.team.logo} alt={lineup.team.name} fill className="object-contain" sizes="20px" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{lineup.team.name}</p>
                <p className="text-[10px] text-gray-400">{lineup.formation}</p>
              </div>
            </div>
            <div className="space-y-1">
              {lineup.startXI.map(({ player }) => (
                <div key={player.id} className="flex items-center gap-2 text-xs">
                  <span className="w-5 text-center text-[10px] font-bold text-gray-400 tabular-nums">{player.number}</span>
                  <span className="truncate text-gray-700">{player.name}</span>
                  <span className="ml-auto text-[10px] text-gray-400 shrink-0">{player.pos}</span>
                </div>
              ))}
            </div>
            {lineup.substitutes.length > 0 && (
              <>
                <p className="mt-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase">Dự bị</p>
                <div className="space-y-1">
                  {lineup.substitutes.map(({ player }) => (
                    <div key={player.id} className="flex items-center gap-2 text-xs text-gray-400">
                      <span className="w-5 text-center text-[10px] tabular-nums">{player.number}</span>
                      <span className="truncate">{player.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
            <p className="mt-2 text-[10px] text-gray-400">HLV: {lineup.coach.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Tỷ lệ kèo ---
async function OddsSection({ fixtureId }: { fixtureId: number }) {
  const odds = await getOddsByFixture(fixtureId)
  if (!odds) return null

  const winner = getMatchWinner(odds)
  const ou = getOverUnder(odds, '2.5')
  const ah = getAsianHandicap(odds)

  if (!winner && !ou && ah.length === 0) return null

  const colorOdd = (odd: string) => {
    const v = parseFloat(odd)
    if (isNaN(v) || odd === '-') return 'text-gray-700'
    if (v < 1.5) return 'text-green-700 font-bold'
    if (v < 2.0) return 'text-green-600'
    if (v > 3.5) return 'text-red-500'
    return 'text-gray-800'
  }

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 bg-green-700 px-4 py-3">
        <TrendingUp size={14} className="text-white" />
        <h2 className="text-sm font-semibold text-white">Tỷ lệ kèo</h2>
        <span className="ml-auto text-xs text-green-200">Bet365</span>
      </div>
      <div className="p-4 space-y-4">
        {/* Kèo 1x2 */}
        {winner && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Kèo 1X2</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '1 (Nhà)', odd: winner.home },
                { label: 'X (Hòa)', odd: winner.draw },
                { label: '2 (Khách)', odd: winner.away },
              ].map(({ label, odd }) => (
                <div key={label} className="rounded-xl bg-gray-50 px-3 py-2.5 text-center">
                  <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                  <p className={`text-base tabular-nums ${colorOdd(odd)}`}>{odd}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Châu Á */}
          {ah.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Kèo châu Á</p>
              <div className="space-y-1.5">
                {ah.slice(0, 2).map((row, i) => (
                  <div key={i} className="grid grid-cols-2 gap-1.5">
                    <div className="rounded-lg bg-gray-50 px-2 py-2 text-center">
                      <p className="text-[9px] text-gray-400 truncate">{row.home.replace('Home ', '')}</p>
                      <p className={`text-sm tabular-nums ${colorOdd(row.homeOdd)}`}>{row.homeOdd}</p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-2 py-2 text-center">
                      <p className="text-[9px] text-gray-400 truncate">{row.away.replace('Away ', '')}</p>
                      <p className={`text-sm tabular-nums ${colorOdd(row.awayOdd)}`}>{row.awayOdd}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tài xỉu */}
          {ou && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Tài/Xỉu</p>
              <div className="space-y-1.5">
                {[
                  { line: '2.5', data: ou },
                  { line: '1.5', data: getOverUnder(odds, '1.5') },
                ].filter(x => x.data).map(({ line, data }) => (
                  <div key={line} className="grid grid-cols-2 gap-1.5">
                    <div className="rounded-lg bg-orange-50 px-2 py-2 text-center">
                      <p className="text-[9px] text-orange-500">Tài {line}</p>
                      <p className={`text-sm tabular-nums ${colorOdd(data!.over)}`}>{data!.over}</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 px-2 py-2 text-center">
                      <p className="text-[9px] text-blue-500">Xỉu {line}</p>
                      <p className={`text-sm tabular-nums ${colorOdd(data!.under)}`}>{data!.under}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// --- Bài viết nhận định ---
async function MatchArticle({ fixtureId }: { fixtureId: number }) {
  const { data: article } = await supabase
    .from('articles')
    .select('id, title, content, author, published_at')
    .eq('match_id', fixtureId)
    .eq('status', 'published')
    .single()

  if (!article) return null

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="bg-green-700 px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Nhận định & Phân tích</h2>
      </div>
      <div className="p-4">
        <h3 className="text-base font-bold text-gray-900 mb-2">{article.title}</h3>
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
          <span>{article.author}</span>
          <span>·</span>
          <span>{formatArticleDate(article.published_at)}</span>
        </div>
        <div
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </div>
  )
}

// --- Page ---
async function MatchContent({ fixtureId }: { fixtureId: number }) {
  const fixture = await getFixtureDetails(fixtureId)

  if (!fixture) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow-sm">
        Không tìm thấy thông tin trận đấu
      </div>
    )
  }

  const hasFinished = ['FT', 'AET', 'PEN'].includes(fixture.fixture.status.short)
  const hasStarted = fixture.fixture.status.short !== 'NS'

  return (
    <div className="space-y-4">
      <Scoreboard fixture={fixture} />
      {/* Kèo — chỉ hiện khi trận chưa bắt đầu hoặc đang diễn ra */}
      {!hasFinished && (
        <Suspense fallback={null}>
          <OddsSection fixtureId={fixture.fixture.id} />
        </Suspense>
      )}
      {hasStarted && <EventsSection fixture={fixture} />}
      {hasFinished && <StatisticsSection fixture={fixture} />}
      {hasFinished && <LineupsSection fixture={fixture} />}
    </div>
  )
}

export default async function TranDauPage(props: PageProps<'/tran-dau/[id]'>) {
  const { id } = await props.params
  const fixtureId = parseInt(id)
  const fixture = await getFixtureDetails(fixtureId)

  return (
    <div className="space-y-4">
      {fixture && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(fixtureJsonLd(fixture)) }}
        />
      )}

      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors">
        <ArrowLeft size={15} />
        Quay lại
      </Link>

      <Suspense fallback={<Skeleton />}>
        <MatchContent fixtureId={fixtureId} />
      </Suspense>

      <Suspense fallback={null}>
        <MatchArticle fixtureId={fixtureId} />
      </Suspense>
    </div>
  )
}
