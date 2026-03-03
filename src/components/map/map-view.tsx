'use client'

import { Map, InfoWindow, useMap } from '@vis.gl/react-google-maps'
import { useState, useEffect, useRef, memo } from 'react'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import { DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from '@/lib/constants'
import { PoleMarker } from './pole-marker'
import { RoutePolyline } from './route-polyline'
import { MapControls } from './map-controls'
import { MapLegend } from './map-legend'
import { InfoWindowContent } from './info-window-content'
import type { Pole, LatLng, PoleStatus, RouteSegment } from '@/types'

const CLUSTERING_THRESHOLD = 500

interface MapViewProps {
  poles: Pole[]
  polylinePoints: LatLng[]
  selectedPoleIndex: number | null
  onSelectPole: (index: number | null) => void
  onPoleStatusChange: (index: number, newStatus: PoleStatus) => void
  segments: RouteSegment[]
}

export const MapView = memo(function MapView({
  poles,
  polylinePoints,
  selectedPoleIndex,
  onSelectPole,
  onPoleStatusChange,
  segments,
}: MapViewProps) {
  const [infoWindowPole, setInfoWindowPole] = useState<{ pole: Pole; index: number } | null>(null)
  const useClustering = poles.length > CLUSTERING_THRESHOLD

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
        {!useClustering &&
          poles.map((pole, index) => (
            <PoleMarker
              key={pole.sequenceNumber}
              pole={pole}
              isSelected={selectedPoleIndex === index}
              onClick={() => handlePoleClick(pole, index)}
            />
          ))}
        {useClustering && (
          <ClusteredMarkers
            poles={poles}
            onPoleClick={handlePoleClick}
          />
        )}
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
})

/** Renders poles with MarkerClusterer for large datasets */
function ClusteredMarkers({
  poles,
  onPoleClick,
}: {
  poles: Pole[]
  onPoleClick: (pole: Pole, index: number) => void
}) {
  const map = useMap()
  const clustererRef = useRef<MarkerClusterer | null>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])

  useEffect(() => {
    if (!map) return

    // Clean up old markers
    markersRef.current.forEach((m) => (m.map = null))
    markersRef.current = []

    const markers = poles.map((pole, index) => {
      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: { lat: pole.lat, lng: pole.lng },
        title: `Poste #${pole.sequenceNumber} (${pole.type})`,
      })
      marker.addListener('click', () => onPoleClick(pole, index))
      return marker
    })
    markersRef.current = markers

    if (clustererRef.current) {
      clustererRef.current.clearMarkers()
      clustererRef.current.addMarkers(markers)
    } else {
      clustererRef.current = new MarkerClusterer({
        map,
        markers,
      })
    }

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers()
      }
    }
  }, [map, poles, onPoleClick])

  return null
}
