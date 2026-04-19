import type { PageContent } from '@/lib/services/content'

interface Props {
  content: PageContent
  className?: string
}

export default function PageContentSection({ content, className = '' }: Props) {
  return (
    <div className={`rounded-xl bg-white shadow-sm overflow-hidden border border-gray-100 ${className}`}>
      <div className="p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-3">{content.title}</h1>
        {content.excerpt && (
          <p className="text-gray-600 mb-4 leading-relaxed">{content.excerpt}</p>
        )}
        <div 
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: content.content }}
        />
        {content.author && (
          <p className="mt-4 text-xs text-gray-400">
            Tác giả: {content.author}
          </p>
        )}
      </div>
    </div>
  )
}
