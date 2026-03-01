'use client'

import { POLE_STATUS_COLORS, POLE_STATUS_LABELS } from '@/lib/constants'
import type { Pole, PoleStatus } from '@/types'

interface InfoWindowContentProps {
  pole: Pole
  onStatusChange?: (newStatus: PoleStatus) => void
}

const statuses: PoleStatus[] = ['nuevo', 'existente', 'en_retiro', 'cambiar']

export function InfoWindowContent({ pole, onStatusChange }: InfoWindowContentProps) {
  const typeLabels = {
    start: 'Inicio',
    intermediate: 'Intermedio',
    end: 'Final',
  }

  return (
    <div className="text-sm min-w-[180px]">
      <p className="font-semibold mb-1">Poste #{pole.sequenceNumber}</p>
      <p>Tipo: {typeLabels[pole.type]}</p>
      <p>Lat: {pole.lat.toFixed(6)}</p>
      <p>Lng: {pole.lng.toFixed(6)}</p>
      {onStatusChange && (
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-1.5">Estado:</p>
          <div className="flex gap-1.5">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => onStatusChange(s)}
                title={POLE_STATUS_LABELS[s]}
                style={{
                  backgroundColor: POLE_STATUS_COLORS[s],
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: pole.status === s ? '3px solid #1e293b' : '2px solid white',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
