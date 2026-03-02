'use client'

import { PROJECT_STATUS_CONFIG } from '@/lib/constants'
import type { ProjectStatus } from '@/types'

interface StatusBadgeProps {
  status: ProjectStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = PROJECT_STATUS_CONFIG[status]

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ color: config.color, backgroundColor: config.bgColor }}
    >
      {config.label}
    </span>
  )
}
