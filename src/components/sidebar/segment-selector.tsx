'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { LINE_SYMBOLOGY_CONFIG, LINE_SYMBOLOGY_COLORS } from '@/lib/constants'
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
  const [color, setColor] = useState<string>(LINE_SYMBOLOGY_COLORS['single'])

  function handleSymbologyChange(s: LineSymbology) {
    setSymbology(s)
    setColor(LINE_SYMBOLOGY_COLORS[s])
  }

  function handleApply() {
    if (fromPole >= toPole || fromPole < 1 || toPole > totalPoles) return
    onAddSegment({ fromPole, toPole, symbology, color })
    // Reset form for next segment — advance fromPole to where this one ended
    setFromPole(toPole)
    setToPole(totalPoles)
  }

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
        Segmentos de linea
      </h3>

      <div className="flex items-center gap-2">
        <label className="text-xs text-[var(--color-text-secondary)] w-12">Desde</label>
        <input
          type="number"
          min={1}
          max={totalPoles - 1}
          value={fromPole}
          onChange={(e) => setFromPole(Number(e.target.value))}
          className="w-16 px-2 py-1 text-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded"
        />
        <label className="text-xs text-[var(--color-text-secondary)] w-12">Hasta</label>
        <input
          type="number"
          min={2}
          max={totalPoles}
          value={toPole}
          onChange={(e) => setToPole(Number(e.target.value))}
          className="w-16 px-2 py-1 text-sm border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] rounded"
        />
      </div>

      <div className="flex gap-2">
        {symbologies.map((s) => (
          <button
            key={s}
            onClick={() => handleSymbologyChange(s)}
            className={`flex-1 py-1.5 text-sm font-mono rounded border transition-colors ${
              symbology === s
                ? 'bg-[var(--color-primary-light)] border-[var(--color-primary)] text-[var(--color-primary-hover)]'
                : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-secondary)]'
            }`}
          >
            {LINE_SYMBOLOGY_CONFIG[s].label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-[var(--color-text-secondary)]">Color</label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded border border-[var(--color-border)] cursor-pointer p-0"
        />
        <span className="text-xs font-mono text-[var(--color-text-muted)]">{color}</span>
      </div>

      <Button size="sm" onClick={handleApply} className="w-full">
        Aplicar simbologia
      </Button>

      {segments.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-[var(--color-text-muted)] font-medium">Tramos asignados:</p>
          {segments.map((seg, i) => (
            <div
              key={`${seg.fromPole}-${seg.toPole}-${seg.symbology}`}
              className="flex items-center justify-between bg-[var(--color-surface-secondary)] rounded px-2 py-1.5 text-xs"
            >
              <span className="flex items-center gap-1.5 text-[var(--color-text-secondary)]">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0 border border-[var(--color-border)]"
                  style={{ backgroundColor: seg.color || LINE_SYMBOLOGY_COLORS[seg.symbology] }}
                />
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
