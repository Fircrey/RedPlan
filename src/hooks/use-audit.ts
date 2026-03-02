'use client'

import { useCallback, useEffect, useState } from 'react'
import type { AuditEntry } from '@/types'

export function useAudit(projectId: string) {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/audit`)
      if (!res.ok) throw new Error('Error al cargar auditoria')
      const data = await res.json()
      setEntries(
        data.map((e: Record<string, unknown>) => ({
          id: e.id,
          projectId: e.project_id,
          userId: e.user_id,
          userEmail: e.user_email,
          action: e.action,
          details: e.details as Record<string, unknown>,
          createdAt: e.created_at,
        })),
      )
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return { entries, loading, refetch: fetchEntries }
}
