import { createClient } from '@/lib/supabase/server'

/**
 * Authenticate the user and return the Supabase client + user.
 * Returns null user if not authenticated.
 */
export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return { supabase, user }
}

/**
 * Verify the authenticated user owns the given project.
 * Returns the project data if the user is the owner, null otherwise.
 */
export async function verifyProjectOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  userId: string,
) {
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error || !project) {
    return null
  }

  // Allow admins to access any project
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role === 'administrador') {
    return project
  }

  // Check ownership
  if (project.user_id !== userId) {
    return null
  }

  return project
}
