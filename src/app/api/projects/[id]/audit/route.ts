import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { apiSuccess, apiUnauthorized, apiServerError } from '@/lib/api-response'
import { paginationSchema } from '@/lib/validations'

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
    .from('audit_log')
    .select('*, profiles:user_id(email)', { count: 'exact' })
    .eq('project_id', id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return apiServerError(error.message)
  }

  const entries = data.map((e: Record<string, unknown>) => {
    const profile = e.profiles as Record<string, unknown> | null
    return {
      id: e.id,
      project_id: e.project_id,
      user_id: e.user_id,
      user_email: profile?.email ?? null,
      action: e.action,
      details: e.details,
      created_at: e.created_at,
    }
  })

  return apiSuccess({ entries, total: count ?? entries.length })
}
