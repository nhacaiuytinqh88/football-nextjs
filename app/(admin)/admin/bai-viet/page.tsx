import type { Metadata } from 'next'
import Link from 'next/link'
import { PlusCircle, Pencil } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
import { formatAdminDate } from '@/lib/date'
import DeleteArticleButton from './DeleteArticleButton'

export const metadata: Metadata = { title: 'Quản lý bài viết' }

export default async function BaiVietPage() {
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug, status, match_id, published_at, created_at')
    .order('created_at', { ascending: false })

  console.log('Articles fetched:', articles?.length, 'Error:', error)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Bài viết ({articles?.length || 0})</h1>
        <Link
          href="/admin/bai-viet/tao-moi"
          className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 transition-colors"
        >
          <PlusCircle size={16} />
          Tạo mới
        </Link>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 text-left">
                <th className="px-4 py-3 font-medium">Tiêu đề</th>
                <th className="px-4 py-3 font-medium w-24">Trạng thái</th>
                <th className="px-4 py-3 font-medium w-24">Match ID</th>
                <th className="px-4 py-3 font-medium w-28">Ngày tạo</th>
                <th className="px-4 py-3 font-medium w-32">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(!articles || articles.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-400">
                    Chưa có bài viết nào
                  </td>
                </tr>
              )}
              {articles?.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 truncate max-w-xs">{a.title}</p>
                    <p className="text-xs text-gray-400 truncate">{a.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      a.status === 'published'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {a.status === 'published' ? 'Đã đăng' : 'Nháp'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {a.match_id ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {formatAdminDate(a.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/admin/bai-viet/${a.id}`}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={16} />
                      </Link>
                      <DeleteArticleButton id={a.id} title={a.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile list */}
        <ul className="divide-y divide-gray-50 md:hidden">
          {(!articles || articles.length === 0) && (
            <li className="px-4 py-10 text-center text-sm text-gray-400">Chưa có bài viết nào</li>
          )}
          {articles?.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{a.title}</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    a.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {a.status === 'published' ? 'Đã đăng' : 'Nháp'}
                  </span>
                  {a.match_id && (
                    <span className="text-xs text-gray-400">#{a.match_id}</span>
                  )}
                </div>
              </div>
              <Link 
                href={`/admin/bai-viet/${a.id}`} 
                className="rounded-lg p-2 text-gray-400 hover:bg-blue-50 hover:text-blue-600"
                title="Chỉnh sửa"
              >
                <Pencil size={16} />
              </Link>
              <DeleteArticleButton id={a.id} title={a.title} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
