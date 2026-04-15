import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase-server'

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

// PUT /api/admin/articles/[id] — Cập nhật bài viết
export async function PUT(request: NextRequest, ctx: RouteContext<'/api/admin/articles/[id]'>) {
  const user = await getAuthUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params
  const body = await request.json()
  const { title, slug, excerpt, content, cover_image, match_id, league_id, author, status, published_at, content_type, page_type } = body

  if (!title || !slug || !content) {
    return Response.json({ error: 'Thiếu trường bắt buộc' }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from('articles')
    .update({ 
      title, slug, excerpt, content, cover_image, match_id, league_id, author, status, published_at, 
      content_type: content_type || 'article',
      page_type: content_type === 'page_content' ? page_type : null
    })
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return Response.json({ error: 'Slug đã tồn tại.' }, { status: 409 })
    }
    return Response.json({ error: error.message }, { status: 500 })
  }

  return Response.json({ success: true })
}

// DELETE /api/admin/articles/[id] — Xóa bài viết
export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/admin/articles/[id]'>) {
  const user = await getAuthUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await ctx.params

  const { error } = await supabaseAdmin
    .from('articles')
    .delete()
    .eq('id', id)

  if (error) return Response.json({ error: error.message }, { status: 500 })

  return Response.json({ success: true })
}
