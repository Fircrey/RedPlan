'use client'

import { POLE_STATUS_COLORS, POLE_STATUS_LABELS, LINE_SYMBOLOGY_CONFIG } from '@/lib/constants'
import type { PoleStatus, LineSymbology } from '@/types'

const statuses: PoleStatus[] = ['nuevo', 'existente', 'en_retiro', 'cambiar']
const symbologies: LineSymbology[] = ['single', 'double', 'triple']

export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-md p-3 text-xs">
      <p className="font-semibold text-gray-700 mb-2">Leyenda</p>

      <div className="space-y-1 mb-3">
        {statuses.map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: POLE_STATUS_COLORS[s] }}
            />
            <span className="text-gray-600">{POLE_STATUS_LABELS[s]}</span>
          </div>
        ))}
      </div>

      <p className="font-semibold text-gray-700 mb-1">Simbologia</p>
      <div className="space-y-1">
        {symbologies.map((s) => (
          <div key={s} className="flex items-center gap-2">
            <span className="font-mono text-gray-800 w-10 text-center">
              {LINE_SYMBOLOGY_CONFIG[s].label}
            </span>
            <span className="text-gray-600">
              {s === 'single' ? 'Simple' : s === 'double' ? 'Doble' : 'Triple'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
