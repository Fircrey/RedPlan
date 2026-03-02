'use client'

import { useProfile } from '@/hooks/use-profile'
import { RoleBadge } from '@/components/ui/role-badge'

export function NavRole() {
  const { profile, loading } = useProfile()

  if (loading || !profile) return null

  return <RoleBadge role={profile.role} />
}
