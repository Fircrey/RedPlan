'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { DEFAULT_SPACING_METERS } from '@/lib/constants'
import type { RouteMode } from '@/types'

interface RouteInputFormProps {
  onCalculate: (data: {
    originLat: number
    originLng: number
    destLat: number
    destLng: number
    spacingMeters: number
    mode: RouteMode
  }) => void
  isCalculating: boolean
}

export function RouteInputForm({ onCalculate, isCalculating }: RouteInputFormProps) {
  const [originLat, setOriginLat] = useState('')
  const [originLng, setOriginLng] = useState('')
  const [destLat, setDestLat] = useState('')
  const [destLng, setDestLng] = useState('')
  const [spacing, setSpacing] = useState(String(DEFAULT_SPACING_METERS))
  const [mode, setMode] = useState<RouteMode>('road_osrm')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onCalculate({
      originLat: parseFloat(originLat),
      originLng: parseFloat(originLng),
      destLat: parseFloat(destLat),
      destLng: parseFloat(destLng),
      spacingMeters: parseFloat(spacing),
      mode,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">Origen</label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            step="any"
            placeholder="Latitud"
            value={originLat}
            onChange={(e) => setOriginLat(e.target.value)}
            required
          />
          <Input
            type="number"
            step="any"
            placeholder="Longitud"
            value={originLng}
            onChange={(e) => setOriginLng(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">Destino</label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            step="any"
            placeholder="Latitud"
            value={destLat}
            onChange={(e) => setDestLat(e.target.value)}
            required
          />
          <Input
            type="number"
            step="any"
            placeholder="Longitud"
            value={destLng}
            onChange={(e) => setDestLng(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">
          Distancia entre postes (m)
        </label>
        <Input
          type="number"
          min="1"
          step="any"
          value={spacing}
          onChange={(e) => setSpacing(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">
          Modo de ruta
        </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as RouteMode)}
          className="flex h-10 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)]"
        >
          <option value="road_osrm">Carretera (OSRM)</option>
          <option value="road_google">Carretera (Google)</option>
          <option value="straight_line">Linea recta</option>
        </select>
      </div>

      <Button type="submit" className="w-full" disabled={isCalculating}>
        {isCalculating ? (
          <span className="flex items-center gap-2">
            <Spinner size="sm" className="border-white border-t-white/30" />
            Calculando...
          </span>
        ) : (
          'Calcular postes'
        )}
      </Button>
    </form>
  )
}
