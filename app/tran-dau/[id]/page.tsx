import { Suspense } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'
import { getFixtureDetail } from '@/lib/services/fixtures'
import { supabase } from '@/lib/supabase'
import MatchStatusBadge from '@/components/ui/MatchStatusBadge'
import { fixtureJsonLd } from '@/lib/json-ld'
import { formatMatchDateTime, formatArticleDate } from '@/lib/date'

// Dynamic metadata cho SEO
export async function generateMetadata(props: PageProps<'/tran-dau/[id]'>): Promise<Metadata> {
  const { id } = await props.params
  const fixture = await getFixtureDetail(parseInt(id))

  if (!fixture) return { title: 'Trận đấu không tồn tại' }

  const { teams, goals, fixture: f, league } = fixture
  const score = `${goals.home ?? '?'} - ${goals.away ?? '?'}`
  const title = `${teams.home.name} ${score} ${teams.away.name} | ${league.name}`
  const description = `Kết quả và thông tin chi tiết trận ${teams.home.name} vs ${teams.away.name} - ${league.name} ${league.season}`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [teams.home.logo, teams.away.logo],
    },
  }
}

// Skeleton
function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 animate-pulse rounded-xl bg-gray-200" />
      <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
    </div>
  )
}

// Component chính hiển thị chi tiết trận
async function MatchDetail({ fixtureId }: { fixtureId: number }) {
  const fixture = await getFixtureDetail(fixtureId)

  if (!fixture) {
    return (
      <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow-sm">
        Không tìm thấy thông tin trận đấu
      </div>
    )
  }

  const { fixture: f, teams, goals, score, league } = fixture
  const isLive = ['1H', '2H', 'HT', 'ET', 'BT', 'P'].includes(f.status.short)

  return (
    <>
      {/* Card tỷ số chính */}
      <div className={`rounded-xl shadow-sm overflow-hidden ${isLive ? 'bg-green-700' : 'bg-gray-800'}`}>
        {/* League info */}
        <div className="flex items-center gap-2 px-4 py-2 bg-black/20">
          <div className="relative h-4 w-4">
            <Image src={league.logo} alt={league.name} fill className="object-contain" sizes="16px" />
          </div>
          <span className="text-xs text-white/80">{league.country} · {league.name}</span>
          <span className="ml-auto text-xs text-white/60">{league.round}</span>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center justify-between px-6 py-5">
          {/* Đội nhà */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="relative h-14 w-14">
              <Image src={teams.home.logo} alt={teams.home.name} fill className="object-contain" sizes="56px" />
            </div>
            <span className="text-sm font-semibold text-white text-center leading-tight max-w-[90px]">
              {teams.home.name}
            </span>
          </div>

          {/* Tỷ số giữa */}
          <div className="flex flex-col items-center gap-1 px-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-bold text-white tabular-nums">
                {goals.home ?? '-'}
              </span>
              <span className="text-2xl text-white/50">:</span>
              <span className="text-4xl font-bold text-white tabular-nums">
                {goals.away ?? '-'}
              </span>
            </div>
            <MatchStatusBadge
              status={f.status.short}
              elapsed={f.status.elapsed}
              date={f.date}
            />
            {/* Tỷ số hiệp 1 */}
            {score.halftime.home !== null && (
              <span className="text-xs text-white/50">
                HT: {score.halftime.home} - {score.halftime.away}
              </span>
            )}
          </div>

          {/* Đội khách */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="relative h-14 w-14">
              <Image src={teams.away.logo} alt={teams.away.name} fill className="object-contain" sizes="56px" />
            </div>
            <span className="text-sm font-semibold text-white text-center leading-tight max-w-[90px]">
              {teams.away.name}
            </span>
          </div>
        </div>

        {/* Thời gian & trọng tài */}
        <div className="flex items-center justify-center gap-4 px-4 py-2 bg-black/20 text-xs text-white/60">
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>{formatMatchDateTime(f.date)}</span>
          </div>
          {f.referee && <span>🏳 {f.referee}</span>}
        </div>
      </div>

      {/* Penalty nếu có */}
      {score.penalty.home !== null && (
        <div className="rounded-xl bg-white shadow-sm px-4 py-3 text-center text-sm text-gray-600">
          Loạt sút penalty: <strong>{score.penalty.home} - {score.penalty.away}</strong>
        </div>
      )}
    </>
  )
}

// Bài viết nhận định từ Supabase
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
        {/* Render HTML content an toàn */}
        <div
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </div>
  )
}

export default async function TranDauPage(props: PageProps<'/tran-dau/[id]'>) {
  const { id } = await props.params
  const fixtureId = parseInt(id)

  // Lấy fixture để render JSON-LD ngay tại page level
  const fixture = await getFixtureDetail(fixtureId)

  return (
    <div className="space-y-4">
      {/* JSON-LD SportsEvent schema */}
      {fixture && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(fixtureJsonLd(fixture)) }}
        />
      )}

      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors"
      >
        <ArrowLeft size={15} />
        Quay lại
      </Link>

      <Suspense fallback={<DetailSkeleton />}>
        <MatchDetail fixtureId={fixtureId} />
      </Suspense>

      <Suspense fallback={null}>
        <MatchArticle fixtureId={fixtureId} />
      </Suspense>
    </div>
  )
}
