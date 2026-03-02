'use client'

import { useState, useMemo } from 'react'
import { useProjects } from '@/hooks/use-projects'
import { useProfile } from '@/hooks/use-profile'
import { useZones } from '@/hooks/use-zones'
import { ProjectCard } from '@/components/dashboard/project-card'
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { StatusFilterTabs } from '@/components/dashboard/status-filter-tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import type { ProjectStatus } from '@/types'

const ALL_STATUSES: ProjectStatus[] = [
  'borrador', 'pendiente_coordinador', 'rechazado',
  'pendiente_gestor', 'contratado', 'en_ejecucion',
  'pendiente_conciliacion', 'en_correccion', 'finalizado',
]

type SortBy = 'name' | 'date' | 'status'
type SortDir = 'asc' | 'desc'

export default function DashboardPage() {
  const { projects, loading, createProject, deleteProject } = useProjects()
  const { profile, loading: profileLoading } = useProfile()
  const { zones } = useZones()
  const [showCreate, setShowCreate] = useState(false)
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortBy>('date')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const role = profile?.role ?? 'supervisor'

  const title = useMemo(() => {
    switch (role) {
      case 'supervisor': return 'Mis proyectos'
      case 'coordinador': return 'Revision de proyectos'
      case 'gestor': return 'Proyectos de mi zona'
      case 'administrador': return 'Todos los proyectos'
    }
  }, [role])

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of projects) {
      counts[p.status] = (counts[p.status] ?? 0) + 1
    }
    return counts
  }, [projects])

  const filteredProjects = useMemo(() => {
    let result = projects

    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter((p) => p.name.toLowerCase().includes(q))
    }

    const statusOrder = ALL_STATUSES.reduce<Record<string, number>>((acc, s, i) => {
      acc[s] = i
      return acc
    }, {})

    result = [...result].sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'date':
          cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'status':
          cmp = (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0)
          break
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [projects, statusFilter, searchQuery, sortBy, sortDir])

  const activeStatuses = useMemo(() => {
    return ALL_STATUSES.filter((s) => (statusCounts[s] ?? 0) > 0)
  }, [statusCounts])

  function toggleSort(field: SortBy) {
    if (sortBy === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(field)
      setSortDir(field === 'name' ? 'asc' : 'desc')
    }
  }

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
        <h1 className="text-2xl font-bold text-[var(--color-text)]">{title}</h1>
        {role === 'supervisor' && (
          <Button onClick={() => setShowCreate(true)}>Nuevo proyecto</Button>
        )}
      </div>

      {/* Search and sort controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Input
          placeholder="Buscar por nombre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sm:max-w-xs"
        />
        <div className="flex gap-1">
          {([['date', 'Fecha'], ['name', 'Nombre'], ['status', 'Estado']] as const).map(([field, label]) => (
            <button
              key={field}
              onClick={() => toggleSort(field)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sortBy === field
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-surface-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]'
              }`}
            >
              {label} {sortBy === field && (sortDir === 'asc' ? '↑' : '↓')}
            </button>
          ))}
        </div>
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
          <p className="text-[var(--color-text-muted)] mb-4">
            {searchQuery.trim()
              ? 'No se encontraron proyectos'
              : statusFilter === 'all'
                ? 'No hay proyectos'
                : 'No hay proyectos con este estado'}
          </p>
          {role === 'supervisor' && statusFilter === 'all' && !searchQuery.trim() && (
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
