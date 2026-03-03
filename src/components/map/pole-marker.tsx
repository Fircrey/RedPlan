'use client'

import { memo } from 'react'
import { AdvancedMarker } from '@vis.gl/react-google-maps'
import { POLE_STATUS_COLORS } from '@/lib/constants'
import type { Pole } from '@/types'

interface PoleMarkerProps {
  pole: Pole
  isSelected: boolean
  onClick: () => void
}

export const PoleMarker = memo(function PoleMarker({ pole, isSelected, onClick }: PoleMarkerProps) {
  const color = POLE_STATUS_COLORS[pole.status]
  const size = isSelected ? 24 : 18

  return (
    <AdvancedMarker
      position={{ lat: pole.lat, lng: pole.lng }}
      onClick={onClick}
      title={`Poste #${pole.sequenceNumber} (${pole.type})`}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            width: size,
            height: size,
            backgroundColor: color,
            border: isSelected ? '3px solid var(--color-primary, #1e40af)' : '2px solid white',
            borderRadius: '50%',
            boxShadow: isSelected
              ? '0 0 0 2px white, 0 2px 8px rgba(0,0,0,0.5)'
              : '0 2px 6px rgba(0,0,0,0.4)',
            transition: 'all 0.15s ease',
          }}
        />
        <span
          style={{
            marginTop: 2,
            fontSize: 10,
            fontWeight: 700,
            color: 'var(--color-text, #1e293b)',
            textShadow: '0 0 3px white, 0 0 3px white',
            lineHeight: 1,
            userSelect: 'none',
          }}
        >
          {pole.sequenceNumber}
        </span>
      </div>
    </AdvancedMarker>
  )
})
