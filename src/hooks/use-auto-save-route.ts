'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { encode } from '@googlemaps/polyline-codec'
import type { Pole, LatLng, CalculateRequest, RouteSegment } from '@/types'

interface UseAutoSaveRouteParams {
  projectId: string
  poles: Pole[]
  polylinePoints: LatLng[]
  totalDistanceMeters: number
  lastRequest: CalculateRequest | null
  segments: RouteSegment[]
  /** Ref that is true once saved data has been restored — skip that first "change" */
  routeRestored: React.RefObject<boolean>
}

const MAX_RETRIES = 3
const BASE_DELAY_MS = 2000

export function useAutoSaveRoute({
  projectId,
  poles,
  polylinePoints,
  totalDistanceMeters,
  lastRequest,
  segments,
  routeRestored,
}: UseAutoSaveRouteParams) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const hasHydrated = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const retryCountRef = useRef(0)

  const dismissError = useCallback(() => setSaveError(null), [])

  useEffect(() => {
    // Don't save if there's nothing to save
    if (!lastRequest || poles.length === 0) return

    // First time we have saveable data: decide whether to skip
    if (!hasHydrated.current) {
      hasHydrated.current = true
      if (routeRestored.current) {
        // Data was just restored from DB — no need to re-save
        return
      }
      // Fresh calculation on a new project — fall through to save
    }

    // Debounce 1.5s
    if (timerRef.current) clearTimeout(timerRef.current)
    setSaved(false)
    setSaveError(null)

    // Capture for closure (TypeScript narrowing doesn't flow into setTimeout)
    const req = lastRequest

    timerRef.current = setTimeout(async () => {
      if (!req) return
      setSaving(true)
      retryCountRef.current = 0

      async function attemptSave(): Promise<boolean> {
        try {
          const polylineEncoded =
            polylinePoints.length > 0
              ? encode(polylinePoints.map((p) => [p.lat, p.lng]))
              : null

          const res = await fetch(`/api/projects/${projectId}/routes`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              originLat: req.originLat,
              originLng: req.originLng,
              destLat: req.destLat,
              destLng: req.destLng,
              spacingMeters: req.spacingMeters,
              mode: req.mode,
              polylineEncoded,
              totalDistanceMeters,
              totalPoles: poles.length,
              poles,
              segments,
            }),
          })

          if (!res.ok) {
            throw new Error(`Save failed (${res.status})`)
          }

          return true
        } catch {
          retryCountRef.current++
          if (retryCountRef.current < MAX_RETRIES) {
            // Exponential backoff
            const delay = BASE_DELAY_MS * Math.pow(2, retryCountRef.current - 1)
            await new Promise((resolve) => setTimeout(resolve, delay))
            return attemptSave()
          }
          return false
        }
      }

      const success = await attemptSave()

      if (success) {
        setSaved(true)
        setSaveError(null)
        if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
        savedTimerRef.current = setTimeout(() => setSaved(false), 2000)
      } else {
        setSaveError('No se pudo guardar la ruta. Los cambios podrian perderse.')
      }

      setSaving(false)
    }, 1500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [projectId, poles, polylinePoints, totalDistanceMeters, lastRequest, segments, routeRestored])

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    }
  }, [])

  return { saving, saved, saveError, dismissError }
}
