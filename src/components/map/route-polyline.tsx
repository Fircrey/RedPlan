'use client'

import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps'
import { useEffect, useRef, useState } from 'react'
import type { LatLng, Pole, RouteSegment } from '@/types'
import { DEFAULT_MAP_ZOOM, LINE_COLOR, LINE_SYMBOLOGY_CONFIG, LINE_SYMBOLOGY_COLORS } from '@/lib/constants'
import { interpolate } from '@/lib/geo/interpolate'

/** Zoom threshold: at or above this level we show the full gap + X icons */
const DETAIL_ZOOM = 15

interface RoutePolylineProps {
  points: LatLng[]
  poles: Pole[]
  segments: RouteSegment[]
}

export function RoutePolyline({ points, poles, segments }: RoutePolylineProps) {
  const map = useMap()
  const mapsLib = useMapsLibrary('maps')
  const polylinesRef = useRef<google.maps.Polyline[]>([])
  const [zoom, setZoom] = useState(DEFAULT_MAP_ZOOM)

  // Track zoom level
  useEffect(() => {
    if (!map) return
    const listener = map.addListener('zoom_changed', () => {
      setZoom(map.getZoom() ?? DEFAULT_MAP_ZOOM)
    })
    // Sync initial zoom
    setZoom(map.getZoom() ?? DEFAULT_MAP_ZOOM)
    return () => listener.remove()
  }, [map])

  useEffect(() => {
    if (!map || !mapsLib || points.length < 2) return

    // Clean up previous polylines
    polylinesRef.current.forEach((p) => p.setMap(null))
    polylinesRef.current = []

    const detailed = zoom >= DETAIL_ZOOM

    if (poles.length < 2) {
      // Fallback: single polyline if no poles
      const polyline = new mapsLib.Polyline({
        path: points.map((p) => ({ lat: p.lat, lng: p.lng })),
        geodesic: true,
        strokeColor: LINE_COLOR,
        strokeOpacity: 0.8,
        strokeWeight: 4,
        map,
      })
      polylinesRef.current.push(polyline)
      return
    }

    // Build polylines for each pole-to-pole segment
    for (let i = 0; i < poles.length - 1; i++) {
      const from = poles[i]
      const to = poles[i + 1]
      const fromNum = from.sequenceNumber

      // Find if this segment has symbology assigned
      const seg = segments.find(
        (s) => fromNum >= s.fromPole && fromNum < s.toPole,
      )

      const fromPt: LatLng = { lat: from.lat, lng: from.lng }
      const toPt: LatLng = { lat: to.lat, lng: to.lng }

      if (seg) {
        const config = LINE_SYMBOLOGY_CONFIG[seg.symbology]
        const segColor = seg.color || LINE_SYMBOLOGY_COLORS[seg.symbology] || LINE_COLOR

        if (detailed) {
          // ── HIGH ZOOM: gap + X icons ──
          const gapStart = 0.5 - config.gapFraction / 2
          const gapEnd = 0.5 + config.gapFraction / 2

          const gapStartPt = interpolate(fromPt, toPt, gapStart)
          const gapEndPt = interpolate(fromPt, toPt, gapEnd)

          // Line from pole A → start of gap
          const line1 = new mapsLib.Polyline({
            path: [fromPt, gapStartPt],
            geodesic: true,
            strokeColor: segColor,
            strokeOpacity: 0.8,
            strokeWeight: 4,
            map,
          })
          polylinesRef.current.push(line1)

          // Line from end of gap → pole B
          const line2 = new mapsLib.Polyline({
            path: [gapEndPt, toPt],
            geodesic: true,
            strokeColor: segColor,
            strokeOpacity: 0.8,
            strokeWeight: 4,
            map,
          })
          polylinesRef.current.push(line2)

          // Invisible carrier line with X icons at precise offsets
          const icons: google.maps.IconSequence[] = config.symbolOffsets.map(
            (offset) => ({
              icon: {
                path: 'M -1,-1 L 1,1 M 1,-1 L -1,1',
                scale: 4,
                strokeColor: segColor,
                strokeWeight: 2.5,
                strokeOpacity: 1,
              },
              offset: `${offset * 100}%`,
              repeat: '0',
            }),
          )

          const line3 = new mapsLib.Polyline({
            path: [fromPt, toPt],
            geodesic: true,
            strokeColor: segColor,
            strokeOpacity: 0,
            strokeWeight: 4,
            icons,
            map,
          })
          polylinesRef.current.push(line3)
        } else {
          // ── LOW ZOOM: dashed line (clean, no piling) ──
          const dashIcon: google.maps.IconSequence = {
            icon: {
              path: 'M 0,-1 L 0,1',
              scale: 3,
              strokeColor: segColor,
              strokeWeight: 2,
              strokeOpacity: 1,
            },
            offset: '0',
            repeat: '12px',
          }

          const polyline = new mapsLib.Polyline({
            path: [fromPt, toPt],
            geodesic: true,
            strokeColor: segColor,
            strokeOpacity: 0.8,
            strokeWeight: 4,
            icons: [dashIcon],
            map,
          })
          polylinesRef.current.push(polyline)
        }
      } else {
        // No symbology — solid yellow line
        const polyline = new mapsLib.Polyline({
          path: [fromPt, toPt],
          geodesic: true,
          strokeColor: LINE_COLOR,
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
  }, [map, mapsLib, points, poles, segments, zoom])

  return null
}
