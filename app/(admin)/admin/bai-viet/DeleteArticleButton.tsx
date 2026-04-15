'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Loader2 } from 'lucide-react'

export default function DeleteArticleButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`⚠️ Xóa bài viết "${title}"?\n\nHành động này không thể hoàn tác!`)) return

    setLoading(true)
    const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })

    if (res.ok) {
      alert('✅ Đã xóa bài viết thành công!')
      router.refresh()
    } else {
      alert('❌ Xóa thất bại, thử lại sau.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border border-red-200 hover:border-red-300 transition-colors disabled:opacity-50"
      title="Xóa bài viết"
      style={{ minWidth: '70px' }}
    >
      {loading ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          <span>Đang xóa...</span>
        </>
      ) : (
        <>
          <Trash2 size={14} />
          <span>Xóa</span>
        </>
      )}
    </button>
  )
}
