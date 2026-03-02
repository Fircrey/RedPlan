'use client'

import { ROLE_LABELS } from '@/lib/constants'
import type { UserRole } from '@/types'

const ROLE_COLORS: Record<UserRole, { color: string; bgColor: string }> = {
  supervisor: { color: '#2563eb', bgColor: '#dbeafe' },
  coordinador: { color: '#7c3aed', bgColor: '#ede9fe' },
  gestor: { color: '#059669', bgColor: '#d1fae5' },
  administrador: { color: '#dc2626', bgColor: '#fee2e2' },
}

interface RoleBadgeProps {
  role: UserRole
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const colors = ROLE_COLORS[role]

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ color: colors.color, backgroundColor: colors.bgColor }}
    >
      {ROLE_LABELS[role]}
    </span>
  )
}
