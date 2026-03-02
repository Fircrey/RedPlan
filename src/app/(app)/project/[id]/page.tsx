import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkspaceClient } from './workspace-client'
import type { Project, ProjectStatus } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: projectData, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !projectData) {
    redirect('/dashboard')
  }

  const project: Project = {
    id: projectData.id,
    userId: projectData.user_id,
    name: projectData.name,
    description: projectData.description,
    status: (projectData.status ?? 'borrador') as ProjectStatus,
    zoneId: projectData.zone_id ?? null,
    createdAt: projectData.created_at,
    updatedAt: projectData.updated_at,
  }

  return <WorkspaceClient project={project} />
}
