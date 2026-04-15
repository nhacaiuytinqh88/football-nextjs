import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getFixtureDetail } from '@/lib/services/fixtures'
import MatchStatusBadge from '@/components/ui/MatchStatusBadge'
import { articleJsonLd } from '@/lib/json-ld'
import { formatArticleDateTime } from '@/lib/date'

// Dynamic metadata
export async function generateMetadata(props: PageProps<'/nhan-dinh/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params
  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt, cover_image')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) return { title: 'Bài viết không tồn tại' }

  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      images: article.cover_image ? [article.cover_image] : [],
    },
  }
}

export default async function NhanDinhDetailPage(props: PageProps<'/nhan-dinh/[slug]'>) {
  const { slug } = await props.params

  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!article) notFound()

  // Nếu bài viết gắn với trận đấu, lấy thêm thông tin trận
  const fixture = article.match_id
    ? await getFixtureDetail(article.match_id)
    : null

  return (
    <div className="space-y-4">
      {/* JSON-LD NewsArticle schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd(article)) }}
      />

      {/* Back */}
      <Link
        href="/nhan-dinh"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-700 transition-colors"
      >
        <ArrowLeft size={15} />
        Nhận định
      </Link>

      <article className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Ảnh bìa */}
        {article.cover_image && (
          <div className="relative h-48 w-full sm:h-64">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
          </div>
        )}

        <div className="p-4">
          {/* Tiêu đề */}
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{article.title}</h1>

          {/* Meta */}
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              <User size={11} />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={11} />
              <span>{formatArticleDateTime(article.published_at)}</span>
            </div>
          </div>

          {/* Mini scoreboard nếu gắn trận */}
          {fixture && (
            <Link
              href={`/tran-dau/${fixture.fixture.id}`}
              className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 hover:bg-green-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="relative h-7 w-7">
                  <Image src={fixture.teams.home.logo} alt={fixture.teams.home.name} fill className="object-contain" sizes="28px" />
                </div>
                <span className="text-sm font-semibold text-gray-800">{fixture.teams.home.name}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-gray-900">
                  {fixture.goals.home ?? '-'} - {fixture.goals.away ?? '-'}
                </span>
                <MatchStatusBadge
                  status={fixture.fixture.status.short}
                  elapsed={fixture.fixture.status.elapsed}
                  date={fixture.fixture.date}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">{fixture.teams.away.name}</span>
                <div className="relative h-7 w-7">
                  <Image src={fixture.teams.away.logo} alt={fixture.teams.away.name} fill className="object-contain" sizes="28px" />
                </div>
              </div>
            </Link>
          )}

          {/* Nội dung bài viết */}
          <div
            className="prose prose-sm max-w-none mt-4 text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />
        </div>
      </article>
    </div>
  )
}
