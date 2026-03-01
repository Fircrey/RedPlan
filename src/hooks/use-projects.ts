'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Project } from '@/types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/projects')
      if (!res.ok) throw new Error('Error al cargar proyectos')
      const data = await res.json()
      setProjects(
        data.map((p: Record<string, unknown>) => ({
          id: p.id,
          userId: p.user_id,
          name: p.name,
          description: p.description,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
        })),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  async function createProject(name: string, description?: string): Promise<Project | null> {
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      if (!res.ok) throw new Error('Error al crear proyecto')
      const p = await res.json()
      const project: Project = {
        id: p.id,
        userId: p.user_id,
        name: p.name,
        description: p.description,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }
      setProjects((prev) => [project, ...prev])
      return project
    } catch {
      return null
    }
  }

  async function deleteProject(id: string) {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar proyecto')
      setProjects((prev) => prev.filter((p) => p.id !== id))
      return true
    } catch {
      return false
    }
  }

  return { projects, loading, error, createProject, deleteProject, refetch: fetchProjects }
}
