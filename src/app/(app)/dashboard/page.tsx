'use client'

import { useState, useMemo } from 'react'
import { useProjects } from '@/hooks/use-projects'
import { useProfile } from '@/hooks/use-profile'
import { useZones } from '@/hooks/use-zones'
import { ProjectCard } from '@/components/dashboard/project-card'
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { StatusFilterTabs } from '@/components/dashboard/status-filter-tabs'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import type { ProjectStatus } from '@/types'

const ALL_STATUSES: ProjectStatus[] = [
  'borrador', 'pendiente_coordinador', 'rechazado',
  'pendiente_gestor', 'contratado', 'en_ejecucion',
  'pendiente_conciliacion', 'en_correccion', 'finalizado',
]

export default function DashboardPage() {
  const { projects, loading, createProject, deleteProject } = useProjects()
  const { profile, loading: profileLoading } = useProfile()
  const { zones } = useZones()
  const [showCreate, setShowCreate] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')

  const role = profile?.role ?? 'supervisor'

  // Title based on role
  const title = useMemo(() => {
    switch (role) {
      case 'supervisor': return 'Mis proyectos'
      case 'coordinador': return 'Revision de proyectos'
      case 'gestor': return 'Proyectos de mi zona'
      case 'administrador': return 'Todos los proyectos'
    }
  }, [role])

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of projects) {
      counts[p.status] = (counts[p.status] ?? 0) + 1
    }
    return counts
  }, [projects])

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (statusFilter === 'all') return projects
    return projects.filter((p) => p.status === statusFilter)
  }, [projects, statusFilter])

  // Statuses with at least one project
  const activeStatuses = useMemo(() => {
    return ALL_STATUSES.filter((s) => (statusCounts[s] ?? 0) > 0)
  }, [statusCounts])

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {role === 'supervisor' && (
          <Button onClick={() => setShowCreate(true)}>Nuevo proyecto</Button>
        )}
      </div>

      {activeStatuses.length > 0 && (
        <StatusFilterTabs
          statuses={activeStatuses}
          selected={statusFilter}
          onSelect={setStatusFilter}
          counts={statusCounts}
        />
      )}

      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">
            {statusFilter === 'all' ? 'No hay proyectos' : 'No hay proyectos con este estado'}
          </p>
          {role === 'supervisor' && statusFilter === 'all' && (
            <Button onClick={() => setShowCreate(true)}>Crear primer proyecto</Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={deleteProject}
              zones={zones}
            />
          ))}
        </div>
      )}

      {role === 'supervisor' && (
        <CreateProjectDialog
          open={showCreate}
          onClose={() => setShowCreate(false)}
          onCreate={createProject}
          zones={zones}
        />
      )}
    </div>
  )
}
