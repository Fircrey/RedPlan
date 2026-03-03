import { NextRequest } from 'next/server'
import { getAuthenticatedUser, verifyProjectOwnership } from '@/lib/api-auth'
import { apiSuccess, apiUnauthorized, apiNotFound, apiServerError, apiError } from '@/lib/api-response'
import { budgetItemCreateSchema, paginationSchema } from '@/lib/validations'

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
    .from('budget_items')
    .select('*', { count: 'exact' })
    .eq('project_id', id)
    .order('created_at')
    .range(offset, offset + limit - 1)

  if (error) {
    return apiServerError(error.message)
  }

  return apiSuccess({ items: data, total: count ?? data.length })
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

  // Verify ownership
  const project = await verifyProjectOwnership(supabase, id, user.id)
  if (!project) {
    return apiNotFound('Project not found')
  }

  const body = await request.json()
  const parsed = budgetItemCreateSchema.safeParse(body)

  if (!parsed.success) {
    return apiError(parsed.error.issues.map((i) => i.message).join(', '))
  }

  const { description, quantity, unit, unit_cost } = parsed.data

  const { data, error } = await supabase
    .from('budget_items')
    .insert({
      project_id: id,
      description,
      quantity,
      unit,
      unit_cost,
    })
    .select()
    .single()

  if (error) {
    return apiServerError(error.message)
  }

  // Audit log
  await supabase.from('audit_log').insert({
    project_id: id,
    user_id: user.id,
    action: 'budget_item_added',
    details: { description, quantity, unit, unit_cost },
  })

  return apiSuccess(data, 201)
}
