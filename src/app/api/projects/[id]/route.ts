import { NextRequest } from 'next/server'
import { getAuthenticatedUser, verifyProjectOwnership } from '@/lib/api-auth'
import { apiSuccess, apiError, apiUnauthorized, apiNotFound, apiServerError } from '@/lib/api-response'
import { projectUpdateSchema } from '@/lib/validations'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return apiUnauthorized()
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return apiNotFound('Project not found')
  }

  return apiSuccess(data)
}

export async function PUT(
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
  const parsed = projectUpdateSchema.safeParse(body)

  if (!parsed.success) {
    return apiError(parsed.error.issues.map((i) => i.message).join(', '))
  }

  const { data, error } = await supabase
    .from('projects')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return apiServerError(error.message)
  }

  return apiSuccess(data)
}

export async function DELETE(
  _request: NextRequest,
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

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    return apiServerError(error.message)
  }

  return apiSuccess({ deleted: true })
}
