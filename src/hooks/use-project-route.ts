'use client'

import { useCallback, useEffect, useState } from 'react'
import { decode } from '@googlemaps/polyline-codec'
import type { Pole, LatLng, RouteSegment, CalculateRequest, RouteMode, PoleType, PoleStatus, LineSymbology } from '@/types'

export interface SavedRouteData {
  poles: Pole[]
  polylinePoints: LatLng[]
  totalDistanceMeters: number
  segments: RouteSegment[]
  lastRequest: CalculateRequest
}

export function useProjectRoute(projectId: string) {
  const [data, setData] = useState<SavedRouteData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchRoute = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/routes`)
      if (!res.ok) throw new Error('Error al cargar ruta')

      const json = await res.json()
      const route = json.data ?? json

      if (!route) {
        setData(null)
        return
      }

      // Decode polyline
      let polylinePoints: LatLng[] = []
      if (route.polyline_encoded) {
        const decoded = decode(route.polyline_encoded)
        polylinePoints = decoded.map(([lat, lng]: [number, number]) => ({ lat, lng }))
      }

      // Map poles from snake_case DB to camelCase app types
      const poles: Pole[] = (route.poles || []).map(
        (p: { sequence_number: number; lat: number; lng: number; type: string; status: string }) => ({
          sequenceNumber: p.sequence_number,
          lat: p.lat,
          lng: p.lng,
          type: p.type as PoleType,
          status: p.status as PoleStatus,
        }),
      )

      // Map segments (ensure numeric types — DB may return strings)
      const segments: RouteSegment[] = (route.segments || []).map(
        (s: { from_pole: number | string; to_pole: number | string; symbology: string }) => ({
          fromPole: Number(s.from_pole),
          toPole: Number(s.to_pole),
          symbology: s.symbology as LineSymbology,
        }),
      )

      // Reconstruct lastRequest from route metadata
      const lastRequest: CalculateRequest = {
        originLat: route.origin_lat,
        originLng: route.origin_lng,
        destLat: route.dest_lat,
        destLng: route.dest_lng,
        spacingMeters: route.spacing_meters,
        mode: route.mode as RouteMode,
      }

      setData({
        poles,
        polylinePoints,
        totalDistanceMeters: route.total_distance_meters,
        segments,
        lastRequest,
      })
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchRoute()
  }, [fetchRoute])

  return { data, loading }
}
