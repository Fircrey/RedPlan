'use client'

import { useState } from 'react'
import { useProjects } from '@/hooks/use-projects'
import { ProjectCard } from '@/components/dashboard/project-card'
import { CreateProjectDialog } from '@/components/dashboard/create-project-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function DashboardPage() {
  const { projects, loading, createProject, deleteProject } = useProjects()
  const [showCreate, setShowCreate] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mis proyectos</h1>
        <Button onClick={() => setShowCreate(true)}>Nuevo proyecto</Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 mb-4">No tienes proyectos aun</p>
          <Button onClick={() => setShowCreate(true)}>Crear primer proyecto</Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onDelete={deleteProject}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={createProject}
      />
    </div>
  )
}
