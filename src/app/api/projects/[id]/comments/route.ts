import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { apiSuccess, apiError, apiUnauthorized, apiServerError } from '@/lib/api-response'
import { commentCreateSchema, paginationSchema } from '@/lib/validations'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return apiUnauthorized()
  }

  const url = new URL(request.url)
  const pagination = paginationSchema.safeParse({
    limit: url.searchParams.get('limit') ?? undefined,
    offset: url.searchParams.get('offset') ?? undefined,
  })
  const { limit, offset } = pagination.success ? pagination.data : { limit: 50, offset: 0 }

  const { data, error, count } = await supabase
    .from('project_comments')
    .select('*, profiles:author_id(email, role)', { count: 'exact' })
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return apiServerError(error.message)
  }

  // Flatten the joined profile data
  const comments = data.map((c: Record<string, unknown>) => {
    const profile = c.profiles as Record<string, unknown> | null
    return {
      id: c.id,
      project_id: c.project_id,
      author_id: c.author_id,
      author_email: profile?.email ?? null,
      author_role: profile?.role ?? null,
      content: c.content,
      created_at: c.created_at,
    }
  })

  return apiSuccess({ comments, total: count ?? comments.length })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return apiUnauthorized()
  }

  const body = await request.json()
  const parsed = commentCreateSchema.safeParse(body)

  if (!parsed.success) {
    return apiError(parsed.error.issues.map((i) => i.message).join(', '))
  }

  const { content } = parsed.data

  const { data, error } = await supabase
    .from('project_comments')
    .insert({
      project_id: id,
      author_id: user.id,
      content,
    })
    .select()
    .single()

  if (error) {
    return apiServerError(error.message)
  }

  await supabase.from('audit_log').insert({
    project_id: id,
    user_id: user.id,
    action: 'comment_added',
    details: { content },
  })

  return apiSuccess(data, 201)
}
