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
      const json = await res.json()
      const data = json.data?.entries ?? json.data ?? json
      const list = (Array.isArray(data) ? data : []) as Record<string, unknown>[]
      setEntries(
        list.map((e): AuditEntry => ({
          id: e.id as string,
          projectId: (e.project_id as string) ?? null,
          userId: e.user_id as string,
          userEmail: e.user_email as string | undefined,
          action: e.action as string,
          details: e.details as Record<string, unknown>,
          createdAt: e.created_at as string,
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
