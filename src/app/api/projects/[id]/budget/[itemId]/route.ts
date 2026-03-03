import { NextRequest } from 'next/server'
import { getAuthenticatedUser, verifyProjectOwnership } from '@/lib/api-auth'
import { apiSuccess, apiError, apiUnauthorized, apiNotFound, apiServerError } from '@/lib/api-response'
import { budgetItemUpdateSchema } from '@/lib/validations'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id, itemId } = await params
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
  const parsed = budgetItemUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return apiError(parsed.error.issues.map((i) => i.message).join(', '))
  }

  const { data, error } = await supabase
    .from('budget_items')
    .update(parsed.data)
    .eq('id', itemId)
    .eq('project_id', id)
    .select()
    .single()

  if (error) {
    return apiServerError(error.message)
  }

  await supabase.from('audit_log').insert({
    project_id: id,
    user_id: user.id,
    action: 'budget_item_updated',
    details: { itemId, ...parsed.data },
  })

  return apiSuccess(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id, itemId } = await params
  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return apiUnauthorized()
  }

  // Verify ownership
  const project = await verifyProjectOwnership(supabase, id, user.id)
  if (!project) {
    return apiNotFound('Project not found')
  }

  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('id', itemId)
    .eq('project_id', id)

  if (error) {
    return apiServerError(error.message)
  }

  await supabase.from('audit_log').insert({
    project_id: id,
    user_id: user.id,
    action: 'budget_item_deleted',
    details: { itemId },
  })

  return apiSuccess({ deleted: true })
}
