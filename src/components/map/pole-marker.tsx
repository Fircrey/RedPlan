'use client'

import { AdvancedMarker } from '@vis.gl/react-google-maps'
import { POLE_STATUS_COLORS } from '@/lib/constants'
import type { Pole } from '@/types'

interface PoleMarkerProps {
  pole: Pole
  isSelected: boolean
  onClick: () => void
}

export function PoleMarker({ pole, isSelected, onClick }: PoleMarkerProps) {
  const color = POLE_STATUS_COLORS[pole.status]
  const size = isSelected ? 16 : 12

  return (
    <AdvancedMarker
      position={{ lat: pole.lat, lng: pole.lng }}
      onClick={onClick}
      title={`Poste #${pole.sequenceNumber} (${pole.type})`}
    >
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          border: isSelected ? '3px solid #1e40af' : '2px solid white',
          borderRadius: '50%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
        }}
      />
    </AdvancedMarker>
  )
}
