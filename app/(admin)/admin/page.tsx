import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, PlusCircle, Eye } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase-server'
import { formatAdminDate } from '@/lib/date'

export const metadata: Metadata = { title: 'Dashboard' }

async function getStats() {
  const [{ count: total }, { count: published }, { count: draft }] = await Promise.all([
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
  ])
  return { total: total ?? 0, published: published ?? 0, draft: draft ?? 0 }
}

async function getRecentArticles() {
  const { data } = await supabaseAdmin
    .from('articles')
    .select('id, title, status, published_at, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  return data ?? []
}

export default async function AdminDashboard() {
  const [stats, recent] = await Promise.all([getStats(), getRecentArticles()])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <Link
          href="/admin/bai-viet/tao-moi"
          className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 transition-colors"
        >
          <PlusCircle size={16} />
          Tạo bài mới
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Tổng bài', value: stats.total, color: 'bg-blue-50 text-blue-700' },
          { label: 'Đã đăng', value: stats.published, color: 'bg-green-50 text-green-700' },
          { label: 'Nháp', value: stats.draft, color: 'bg-yellow-50 text-yellow-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium opacity-80">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bài viết gần đây */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <FileText size={15} />
            Bài viết gần đây
          </h2>
          <Link href="/admin/bai-viet" className="text-xs text-green-700 hover:underline">
            Xem tất cả
          </Link>
        </div>
        <ul className="divide-y divide-gray-50">
          {recent.length === 0 && (
            <li className="px-4 py-8 text-center text-sm text-gray-400">Chưa có bài viết nào</li>
          )}
          {recent.map((a) => (
            <li key={a.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{a.title}</p>
                <p className="text-xs text-gray-400">
                  {formatAdminDate(a.created_at)}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                a.status === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {a.status === 'published' ? 'Đã đăng' : 'Nháp'}
              </span>
              <Link
                href={`/admin/bai-viet/${a.id}`}
                className="shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <Eye size={15} />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
