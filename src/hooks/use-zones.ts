'use client'

import { useCallback, useEffect, useState } from 'react'
import type { Zone } from '@/types'

export function useZones() {
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)

  const fetchZones = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/zones')
      if (!res.ok) throw new Error('Error al cargar zonas')
      const data = await res.json()
      setZones(
        data.map((z: Record<string, unknown>) => ({
          id: z.id,
          name: z.name,
          description: z.description,
        })),
      )
    } catch {
      setZones([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchZones()
  }, [fetchZones])

  return { zones, loading }
}
