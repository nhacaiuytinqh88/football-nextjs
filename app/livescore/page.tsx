import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Activity, Calendar } from 'lucide-react'
import FixtureList from '@/components/ui/FixtureList'
import PageContentSection from '@/components/ui/PageContent'
import { getLiveMatches } from '@/lib/services/live'
import { getTodayFixtures } from '@/lib/services/fixtures'
import { getPageContentByPath } from '@/lib/services/content'
import { websiteJsonLd, organizationJsonLd } from '@/lib/json-ld'

export async function generateMetadata(): Promise<Metadata> {
  const pageContent = await getPageContentByPath('/livescore')
  
  return {
    title: pageContent?.title || 'Livescore bóng đá trực tiếp',
    description: pageContent?.excerpt || 'Theo dõi livescore bóng đá trực tiếp, kết qu�?các trận đấu đang diễn ra và sắp diễn ra hôm nay.',
  }
}

// --- Skeleton ---
function MatchListSkeleton() {
  return (
    <div className="divide-y divide-gray-50">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-3">
          <div className="h-8 w-10 animate-pulse rounded bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}

// --- Live Section (Server Component, fetch t�?Redis) ---
async function LiveSection() {
  const fixtures = await getLiveMatches()

  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 bg-green-700 px-4 py-3">
        <Activity size={15} className="text-white" />
        <h2 className="text-sm font-semibold text-white">Đang diễn ra</h2>
        {fixtures.length > 0 && (
          <span className="ml-1 rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white animate-pulse">
            {fixtures.length} LIVE
          </span>
        )}
      </div>
      <FixtureList
        fixtures={fixtures}
        emptyMessage="Hiện không có trận nào đang diễn ra"
      />
    </div>
  )
}

// --- Today Fixtures Section (Server Component) ---
async function TodaySection() {
  const fixtures = await getTodayFixtures()

  // Lọc ra các trận chưa đá (NS) và đã kết thúc (FT, AET, PEN)
  const upcoming = fixtures.filter((f) => f.fixture.status.short === 'NS')
  const finished = fixtures.filter((f) =>
    ['FT', 'AET', 'PEN'].includes(f.fixture.status.short)
  )

  return (
    <>
      {/* Sắp diễn ra */}
      {upcoming.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-blue-700 px-4 py-3">
            <Calendar size={15} className="text-white" />
            <h2 className="text-sm font-semibold text-white">Sắp diễn ra hôm nay</h2>
            <span className="ml-auto text-xs text-blue-200">{upcoming.length} trận</span>
          </div>
          <FixtureList fixtures={upcoming} />
        </div>
      )}

      {/* Kết qu�?hôm nay */}
      {finished.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-gray-600 px-4 py-3">
            <h2 className="text-sm font-semibold text-white">Kết qu�?hôm nay</h2>
            <span className="ml-auto text-xs text-gray-300">{finished.length} trận</span>
          </div>
          <FixtureList fixtures={finished} />
        </div>
      )}

      {upcoming.length === 0 && finished.length === 0 && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 bg-gray-600 px-4 py-3">
            <Calendar size={15} className="text-white" />
            <h2 className="text-sm font-semibold text-white">Lịch thi đấu hôm nay</h2>
          </div>
          <div className="px-4 py-10 text-center text-sm text-gray-400">
            Không có trận đấu nào hôm nay
          </div>
        </div>
      )}
    </>
  )
}

// --- Page ---
export default async function LivescorePage() {
  // Lấy nội dung CMS cho trang livescore
  const pageContent = await getPageContentByPath('/livescore')

  return (
    <div className="space-y-4">
      {/* JSON-LD WebSite schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />
      
      {/* JSON-LD Organization schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }}
      />
      
      <Suspense fallback={<MatchListSkeleton />}>
        <LiveSection />
      </Suspense>
      <Suspense fallback={<MatchListSkeleton />}>
        <TodaySection />
      </Suspense>

      {/* Nội dung CMS - hiển th�?�?cuối trang */}
      {pageContent && (
        <PageContentSection content={pageContent} />
      )}
    </div>
  )
}
