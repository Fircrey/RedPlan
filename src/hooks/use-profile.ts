'use client'

import { useCallback, useEffect, useState } from 'react'
import type { UserProfile } from '@/types'

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Error al cargar perfil')
      const data = await res.json()
      setProfile({
        id: data.id,
        email: data.email,
        role: data.role,
        zoneId: data.zone_id,
        fullName: data.full_name,
      })
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, refetch: fetchProfile }
}
