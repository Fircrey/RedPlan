import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-auth'
import { apiSuccess, apiError, apiUnauthorized, apiNotFound, apiForbidden, apiServerError } from '@/lib/api-response'
import { statusTransitionSchema } from '@/lib/validations'
import { STATUS_TRANSITIONS } from '@/lib/constants'
import type { ProjectStatus, UserRole } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return apiUnauthorized()
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return apiNotFound('Profile not found')
  }

  const role = profile.role as UserRole

  // Get current project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (projectError || !project) {
    return apiNotFound('Project not found')
  }

  const body = await request.json()
  const parsed = statusTransitionSchema.safeParse(body)

  if (!parsed.success) {
    return apiError(parsed.error.issues.map((i) => i.message).join(', '))
  }

  const { status: newStatus, comment } = parsed.data

  // Validate transition
  const currentStatus = project.status as ProjectStatus
  const allowedTransitions = STATUS_TRANSITIONS[role]?.[currentStatus]

  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    return apiForbidden(
      `Transition from '${currentStatus}' to '${newStatus}' not allowed for role '${role}'`,
    )
  }

  // Require comment for rejection or correction
  if ((newStatus === 'rechazado' || newStatus === 'en_correccion') && !comment) {
    return apiError('Comment is required for rejection or correction')
  }

  // Update project status
  const { error: updateError } = await supabase
    .from('projects')
    .update({ status: newStatus })
    .eq('id', id)

  if (updateError) {
    return apiServerError(updateError.message)
  }

  // Insert audit log
  await supabase.from('audit_log').insert({
    project_id: id,
    user_id: user.id,
    action: 'status_change',
    details: {
      from: currentStatus,
      to: newStatus,
      role,
      ...(comment ? { comment } : {}),
    },
  })

  // Insert comment if provided
  if (comment) {
    await supabase.from('project_comments').insert({
      project_id: id,
      author_id: user.id,
      content: comment,
    })
  }

  return apiSuccess({ status: newStatus })
}
