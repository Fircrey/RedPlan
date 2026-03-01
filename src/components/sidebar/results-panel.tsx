'use client'

import { PoleListItem } from './pole-list-item'
import type { Pole } from '@/types'

interface ResultsPanelProps {
  poles: Pole[]
  totalDistanceMeters: number
  selectedPoleIndex: number | null
  onSelectPole: (index: number | null) => void
}

function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`
  }
  return `${meters.toFixed(0)} m`
}

export function ResultsPanel({
  poles,
  totalDistanceMeters,
  selectedPoleIndex,
  onSelectPole,
}: ResultsPanelProps) {
  if (poles.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-blue-600 font-medium uppercase">Distancia</p>
          <p className="text-lg font-bold text-blue-900">{formatDistance(totalDistanceMeters)}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-green-600 font-medium uppercase">Postes</p>
          <p className="text-lg font-bold text-green-900">{poles.length}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Lista de postes
        </h3>
        <div className="max-h-[400px] overflow-y-auto space-y-0.5">
          {poles.map((pole, index) => (
            <PoleListItem
              key={pole.sequenceNumber}
              pole={pole}
              isSelected={selectedPoleIndex === index}
              onClick={() => onSelectPole(selectedPoleIndex === index ? null : index)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
