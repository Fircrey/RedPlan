'use client'

import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { useEffect, useRef } from 'react'
import type { LatLng, Pole, RouteSegment } from '@/types'
import { LINE_SYMBOLOGY_CONFIG } from '@/lib/constants'

interface RoutePolylineProps {
  points: LatLng[]
  poles: Pole[]
  segments: RouteSegment[]
}

export function RoutePolyline({ points, poles, segments }: RoutePolylineProps) {
  const map = useMap()
  const mapsLib = useMapsLibrary('maps')
  const polylinesRef = useRef<google.maps.Polyline[]>([])

  useEffect(() => {
    if (!map || !mapsLib || points.length < 2) return

    // Clean up previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null))
    polylinesRef.current = []

    if (poles.length < 2) {
      // Fallback: single polyline if no poles
      const polyline = new mapsLib.Polyline({
        path: points.map((p) => ({ lat: p.lat, lng: p.lng })),
        geodesic: true,
        strokeColor: '#3b82f6',
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
      })
      polylinesRef.current.push(polyline)
      return
    }

    // Build a polyline for each pole-to-pole segment
    for (let i = 0; i < poles.length - 1; i++) {
      const from = poles[i]
      const to = poles[i + 1]
      const fromNum = from.sequenceNumber

      // Find if this segment has symbology assigned
      const seg = segments.find(
        (s) => fromNum >= s.fromPole && fromNum < s.toPole,
      )

      const path = [
        { lat: from.lat, lng: from.lng },
        { lat: to.lat, lng: to.lng },
      ]

      if (seg) {
        const config = LINE_SYMBOLOGY_CONFIG[seg.symbology]
        const icons: google.maps.IconSequence[] = []

        // Create repeated "x" symbols along the line
        for (let r = 0; r < config.repeatCount; r++) {
          icons.push({
            icon: {
              path: 'M -1,-1 L 1,1 M 1,-1 L -1,1',
              scale: 3,
              strokeColor: '#1e293b',
              strokeWeight: 2,
              strokeOpacity: 1,
            },
            offset: '0',
            repeat: `${60 / config.repeatCount}px`,
          })
        }

        const polyline = new mapsLib.Polyline({
          path,
          geodesic: true,
          strokeColor: '#3b82f6',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          icons,
          map,
        })
        polylinesRef.current.push(polyline)
      } else {
        // No symbology — solid line
        const polyline = new mapsLib.Polyline({
          path,
          geodesic: true,
          strokeColor: '#3b82f6',
          strokeOpacity: 0.8,
          strokeWeight: 4,
          map,
        })
        polylinesRef.current.push(polyline)
      }
    }

    return () => {
      polylinesRef.current.forEach((p) => p.setMap(null))
      polylinesRef.current = []
    }
  }, [map, mapsLib, points, poles, segments])

  return null
}
