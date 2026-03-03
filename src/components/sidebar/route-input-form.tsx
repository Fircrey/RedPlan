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

function isValidLat(v: string): boolean {
  const n = parseFloat(v)
  return !isNaN(n) && n >= -90 && n <= 90
}

function isValidLng(v: string): boolean {
  const n = parseFloat(v)
  return !isNaN(n) && n >= -180 && n <= 180
}

function isValidSpacing(v: string): boolean {
  const n = parseFloat(v)
  return !isNaN(n) && n > 0 && n <= 10_000
}

export function RouteInputForm({ onCalculate, isCalculating }: RouteInputFormProps) {
  const [originLat, setOriginLat] = useState('')
  const [originLng, setOriginLng] = useState('')
  const [destLat, setDestLat] = useState('')
  const [destLng, setDestLng] = useState('')
  const [spacing, setSpacing] = useState(String(DEFAULT_SPACING_METERS))
  const [mode, setMode] = useState<RouteMode>('road_osrm')
  const [errors, setErrors] = useState<string[]>([])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newErrors: string[] = []

    if (!isValidLat(originLat)) newErrors.push('Latitud de origen debe estar entre -90 y 90')
    if (!isValidLng(originLng)) newErrors.push('Longitud de origen debe estar entre -180 y 180')
    if (!isValidLat(destLat)) newErrors.push('Latitud de destino debe estar entre -90 y 90')
    if (!isValidLng(destLng)) newErrors.push('Longitud de destino debe estar entre -180 y 180')
    if (!isValidSpacing(spacing)) newErrors.push('Distancia entre postes debe ser entre 1 y 10,000 m')

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors([])
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
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {errors.length > 0 && (
        <div className="text-xs text-red-600 bg-red-50 rounded-lg p-2 space-y-0.5" role="alert">
          {errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      <div>
        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wide">Origen</label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            step="any"
            min="-90"
            max="90"
            placeholder="Latitud"
            aria-label="Latitud de origen"
            value={originLat}
            onChange={(e) => setOriginLat(e.target.value)}
            required
          />
          <Input
            type="number"
            step="any"
            min="-180"
            max="180"
            placeholder="Longitud"
            aria-label="Longitud de origen"
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
            min="-90"
            max="90"
            placeholder="Latitud"
            aria-label="Latitud de destino"
            value={destLat}
            onChange={(e) => setDestLat(e.target.value)}
            required
          />
          <Input
            type="number"
            step="any"
            min="-180"
            max="180"
            placeholder="Longitud"
            aria-label="Longitud de destino"
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
          max="10000"
          step="any"
          aria-label="Distancia entre postes en metros"
          value={spacing}
          onChange={(e) => setSpacing(e.target.value)}
          required
        />
      </div>

      <div>
        <label
          htmlFor="route-mode-select"
          className="block text-xs font-medium text-[var(--color-text-muted)] mb-1 uppercase tracking-wide"
        >
          Modo de ruta
        </label>
        <select
          id="route-mode-select"
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
