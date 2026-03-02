'use client'

import { Map, InfoWindow } from '@vis.gl/react-google-maps'
import { useState } from 'react'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants'
import { PoleMarker } from './pole-marker'
import { RoutePolyline } from './route-polyline'
import { MapControls } from './map-controls'
import { MapLegend } from './map-legend'
import { InfoWindowContent } from './info-window-content'
import type { Pole, LatLng, PoleStatus, RouteSegment } from '@/types'

interface MapViewProps {
  poles: Pole[]
  polylinePoints: LatLng[]
  selectedPoleIndex: number | null
  onSelectPole: (index: number | null) => void
  onPoleStatusChange: (index: number, newStatus: PoleStatus) => void
  segments: RouteSegment[]
}

export function MapView({
  poles,
  polylinePoints,
  selectedPoleIndex,
  onSelectPole,
  onPoleStatusChange,
  segments,
}: MapViewProps) {
  const [infoWindowPole, setInfoWindowPole] = useState<{ pole: Pole; index: number } | null>(null)

  function handlePoleClick(pole: Pole, index: number) {
    onSelectPole(index)
    setInfoWindowPole({ pole, index })
  }

  return (
    <div className="relative w-full h-full">
      <Map
        defaultCenter={DEFAULT_MAP_CENTER}
        defaultZoom={DEFAULT_MAP_ZOOM}
        mapId="redplan-map"
        gestureHandling="greedy"
        disableDefaultUI={false}
        className="w-full h-full"
      >
        <RoutePolyline points={polylinePoints} poles={poles} segments={segments} />
        {poles.map((pole, index) => (
          <PoleMarker
            key={pole.sequenceNumber}
            pole={pole}
            isSelected={selectedPoleIndex === index}
            onClick={() => handlePoleClick(pole, index)}
          />
        ))}
        {infoWindowPole && (
          <InfoWindow
            position={{ lat: infoWindowPole.pole.lat, lng: infoWindowPole.pole.lng }}
            onCloseClick={() => {
              setInfoWindowPole(null)
              onSelectPole(null)
            }}
          >
            <InfoWindowContent
              pole={infoWindowPole.pole}
              onStatusChange={(newStatus) => {
                onPoleStatusChange(infoWindowPole.index, newStatus)
                setInfoWindowPole({
                  ...infoWindowPole,
                  pole: { ...infoWindowPole.pole, status: newStatus },
                })
              }}
            />
          </InfoWindow>
        )}
      </Map>
      <MapControls poles={poles} />
      {poles.length > 0 && <MapLegend />}
    </div>
  )
}
