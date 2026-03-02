'use client'

import { useState } from 'react'
import { STATUS_TRANSITIONS } from '@/lib/constants'
import type { ProjectStatus, UserRole } from '@/types'

export function useProjectWorkflow(projectId: string) {
  const [transitioning, setTransitioning] = useState(false)

  function getAvailableTransitions(role: UserRole, currentStatus: ProjectStatus): ProjectStatus[] {
    return (STATUS_TRANSITIONS[role]?.[currentStatus] as ProjectStatus[] | undefined) ?? []
  }

  async function transition(newStatus: ProjectStatus, comment?: string) {
    setTransitioning(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, comment }),
      })
      if (!res.ok) {
        const data = await res.json()
        return { success: false, error: data.error || 'Error al cambiar estado' }
      }
      return { success: true, error: null }
    } catch {
      return { success: false, error: 'Error de red' }
    } finally {
      setTransitioning(false)
    }
  }

  return { getAvailableTransitions, transition, transitioning }
}
