import Link from 'next/link'
import { FileText, Clock, User } from 'lucide-react'
import { formatArticleDate } from '@/lib/date'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  author: string
  published_at: string
  match_id: number | null
  league_id: number | null
}

interface Props {
  article: Article
  variant?: 'default' | 'compact'
}

// Server Component — dùng chung ở trang nhận định, trang giải đấu
export default function ArticleCard({ article, variant = 'default' }: Props) {
  if (variant === 'compact') {
    return (
      <Link
        href={`/nhan-dinh/${article.slug}`}
        className="flex gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        {/* Thumbnail nhỏ */}
        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
          {article.cover_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={article.cover_image} alt={article.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <FileText size={18} className="text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-between min-w-0">
          <h3 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-snug">
            {article.title}
          </h3>
          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-1">
            <Clock size={10} />
            <span>{formatArticleDate(article.published_at)}</span>
            <span>·</span>
            <span>{article.author}</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      href={`/nhan-dinh/${article.slug}`}
      className="flex gap-3 p-4 hover:bg-gray-50 transition-colors"
    >
      {/* Ảnh bìa */}
      <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {article.cover_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.cover_image} alt={article.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center bg-green-50">
            <FileText size={24} className="text-green-300" />
          </div>
        )}
      </div>

      {/* Nội dung */}
      <div className="flex flex-col justify-between min-w-0">
        <h2 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
          {article.title}
        </h2>
        {article.excerpt && (
          <p className="mt-1 text-xs text-gray-500 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
          <User size={10} />
          <span>{article.author}</span>
          <span>·</span>
          <Clock size={10} />
          <span>{formatArticleDate(article.published_at)}</span>
        </div>
      </div>
    </Link>
  )
}
