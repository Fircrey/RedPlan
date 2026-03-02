'use client'

import { cn } from '@/lib/utils'
import { POLE_STATUS_COLORS, POLE_STATUS_LABELS } from '@/lib/constants'
import type { Pole } from '@/types'

interface PoleListItemProps {
  pole: Pole
  isSelected: boolean
  onClick: () => void
}

export function PoleListItem({ pole, isSelected, onClick }: PoleListItemProps) {
  const color = POLE_STATUS_COLORS[pole.status]

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-lg transition-colors hover:bg-[var(--color-surface-secondary)]',
        isSelected && 'bg-[var(--color-primary-light)] hover:bg-[var(--color-primary-light)]',
      )}
    >
      <div
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      <span className="font-medium text-[var(--color-text-secondary)] w-8">#{pole.sequenceNumber}</span>
      <span className="text-[var(--color-text-muted)] text-xs">{POLE_STATUS_LABELS[pole.status]}</span>
      <span className="text-[var(--color-text-muted)] truncate ml-auto text-xs">
        {pole.lat.toFixed(4)}, {pole.lng.toFixed(4)}
      </span>
    </button>
  )
}
