'use client'

import { PROJECT_STATUS_CONFIG } from '@/lib/constants'
import type { ProjectStatus } from '@/types'

interface StatusFilterTabsProps {
  statuses: ProjectStatus[]
  selected: ProjectStatus | 'all'
  onSelect: (status: ProjectStatus | 'all') => void
  counts: Record<string, number>
}

export function StatusFilterTabs({ statuses, selected, onSelect, counts }: StatusFilterTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSelect('all')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === 'all'
            ? 'bg-gray-900 text-white'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        Todos ({Object.values(counts).reduce((a, b) => a + b, 0)})
      </button>
      {statuses.map((status) => {
        const config = PROJECT_STATUS_CONFIG[status]
        const count = counts[status] ?? 0
        return (
          <button
            key={status}
            onClick={() => onSelect(status)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={
              selected === status
                ? { backgroundColor: config.color, color: 'white' }
                : { backgroundColor: config.bgColor, color: config.color }
            }
          >
            {config.label} ({count})
          </button>
        )
      })}
    </div>
  )
}
