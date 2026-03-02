'use client'

import { useEffect, useRef, useState } from 'react'
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
  const hasHydrated = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

    timerRef.current = setTimeout(async () => {
      setSaving(true)
      try {
        const polylineEncoded =
          polylinePoints.length > 0
            ? encode(polylinePoints.map((p) => [p.lat, p.lng]))
            : null

        await fetch(`/api/projects/${projectId}/routes`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            originLat: lastRequest.originLat,
            originLng: lastRequest.originLng,
            destLat: lastRequest.destLat,
            destLng: lastRequest.destLng,
            spacingMeters: lastRequest.spacingMeters,
            mode: lastRequest.mode,
            polylineEncoded,
            totalDistanceMeters,
            totalPoles: poles.length,
            poles,
            segments,
          }),
        })
      } catch {
        // Silent fail — will retry on next change
      } finally {
        setSaving(false)
      }
    }, 1500)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [projectId, poles, polylinePoints, totalDistanceMeters, lastRequest, segments, routeRestored])

  return { saving }
}
