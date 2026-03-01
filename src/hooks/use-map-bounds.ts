'use client'

import { useMap } from '@vis.gl/react-google-maps'
import { useEffect } from 'react'
import type { Pole } from '@/types'

export function useMapBounds(poles: Pole[]) {
  const map = useMap()

  useEffect(() => {
    if (!map || poles.length === 0) return

    const bounds = new google.maps.LatLngBounds()
    poles.forEach((pole) => {
      bounds.extend({ lat: pole.lat, lng: pole.lng })
    })
    map.fitBounds(bounds, 60)
  }, [map, poles])
}
