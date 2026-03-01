'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LINE_SYMBOLOGY_CONFIG } from '@/lib/constants'
import type { LineSymbology, RouteSegment } from '@/types'

interface SegmentSelectorProps {
  totalPoles: number
  segments: RouteSegment[]
  onAddSegment: (segment: RouteSegment) => void
  onRemoveSegment: (index: number) => void
}

const symbologies: LineSymbology[] = ['single', 'double', 'triple']

export function SegmentSelector({
  totalPoles,
  segments,
  onAddSegment,
  onRemoveSegment,
}: SegmentSelectorProps) {
  const [fromPole, setFromPole] = useState(1)
  const [toPole, setToPole] = useState(totalPoles)
  const [symbology, setSymbology] = useState<LineSymbology>('single')

  function handleApply() {
    if (fromPole >= toPole || fromPole < 1 || toPole > totalPoles) return
    onAddSegment({ fromPole, toPole, symbology })
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Simbologia de linea
      </h3>

      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-600 w-12">Desde</label>
        <input
          type="number"
          min={1}
          max={totalPoles - 1}
          value={fromPole}
          onChange={(e) => setFromPole(Number(e.target.value))}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
        />
        <label className="text-xs text-gray-600 w-12">Hasta</label>
        <input
          type="number"
          min={2}
          max={totalPoles}
          value={toPole}
          onChange={(e) => setToPole(Number(e.target.value))}
          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
        />
      </div>

      <div className="flex gap-2">
        {symbologies.map((s) => (
          <button
            key={s}
            onClick={() => setSymbology(s)}
            className={`flex-1 py-1.5 text-sm font-mono rounded border transition-colors ${
              symbology === s
                ? 'bg-blue-100 border-blue-400 text-blue-800'
                : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {LINE_SYMBOLOGY_CONFIG[s].label}
          </button>
        ))}
      </div>

      <Button size="sm" onClick={handleApply} className="w-full">
        Aplicar simbologia
      </Button>

      {segments.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-gray-500 font-medium">Tramos asignados:</p>
          {segments.map((seg, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-gray-50 rounded px-2 py-1.5 text-xs"
            >
              <span className="text-gray-700">
                Postes {seg.fromPole}-{seg.toPole}:{' '}
                <span className="font-mono font-semibold">
                  {LINE_SYMBOLOGY_CONFIG[seg.symbology].label}
                </span>
              </span>
              <button
                onClick={() => onRemoveSegment(i)}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
