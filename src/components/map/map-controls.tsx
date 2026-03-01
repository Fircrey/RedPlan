'use client'

import { useMap } from '@vis.gl/react-google-maps'
import { Button } from '@/components/ui/button'
import type { Pole } from '@/types'

interface MapControlsProps {
  poles: Pole[]
}

export function MapControls({ poles }: MapControlsProps) {
  const map = useMap()

  function fitBounds() {
    if (!map || poles.length === 0) return

    const bounds = new google.maps.LatLngBounds()
    poles.forEach((pole) => {
      bounds.extend({ lat: pole.lat, lng: pole.lng })
    })
    map.fitBounds(bounds, 60)
  }

  return (
    <div className="absolute top-4 right-4 z-10">
      <Button
        variant="secondary"
        size="sm"
        onClick={fitBounds}
        disabled={poles.length === 0}
        className="shadow-md"
      >
        Ajustar vista
      </Button>
    </div>
  )
}
