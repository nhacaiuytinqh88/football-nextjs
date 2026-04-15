import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-server'

// Kiểm tra session admin
async function getAuthUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// POST /api/admin/articles — Tạo bài viết mới
export async function POST(request: NextRequest) {
  const user = await getAuthUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { title, slug, excerpt, content, cover_image, match_id, league_id, author, status, published_at, content_type, page_type, page_path } = body

  if (!title || !slug || !content) {
    return Response.json({ error: 'Thiếu trường bắt buộc: title, slug, content' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('articles')
    .insert({ 
      title, slug, excerpt, content, cover_image, match_id, league_id, author, status, published_at, 
      content_type: content_type || 'article',
      page_type: content_type === 'page_content' ? page_type : null,
      page_path: content_type === 'page_content' ? page_path : null
    })
    .select('id')
    .single()

  if (error) {
    // Slug trùng
    if (error.code === '23505') {
      return Response.json({ error: 'Slug đã tồn tại, vui lòng dùng slug khác.' }, { status: 409 })
    }
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ id: data.id }, { status: 201 })
}
