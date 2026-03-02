import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { STATUS_TRANSITIONS } from '@/lib/constants'
import type { ProjectStatus, UserRole } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const role = profile.role as UserRole

  // Get current project
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const body = await request.json()
  const { status: newStatus, comment } = body as { status: ProjectStatus; comment?: string }

  if (!newStatus) {
    return NextResponse.json({ error: 'New status is required' }, { status: 400 })
  }

  // Validate transition
  const currentStatus = project.status as ProjectStatus
  const allowedTransitions = STATUS_TRANSITIONS[role]?.[currentStatus]

  if (!allowedTransitions || !allowedTransitions.includes(newStatus)) {
    return NextResponse.json(
      { error: `Transition from '${currentStatus}' to '${newStatus}' not allowed for role '${role}'` },
      { status: 403 },
    )
  }

  // Require comment for rejection or correction
  if ((newStatus === 'rechazado' || newStatus === 'en_correccion') && !comment) {
    return NextResponse.json(
      { error: 'Comment is required for rejection or correction' },
      { status: 400 },
    )
  }

  // Update project status
  const { error: updateError } = await supabase
    .from('projects')
    .update({ status: newStatus })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  // Insert audit log
  await supabase.from('audit_log').insert({
    project_id: id,
    user_id: user.id,
    action: `status_change`,
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

  return NextResponse.json({ success: true, status: newStatus })
}
