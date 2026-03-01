import type { LatLng, Pole } from '@/types'
import { haversineDistance } from './haversine'
import { interpolate } from './interpolate'

/**
 * Distribute poles along a straight line (great circle) between two points.
 */
export function distributePolesStraightLine(
  origin: LatLng,
  destination: LatLng,
  spacingMeters: number,
): Pole[] {
  const totalDistance = haversineDistance(origin, destination)
  const segmentCount = Math.ceil(totalDistance / spacingMeters)

  if (segmentCount === 0) {
    return [
      { sequenceNumber: 1, lat: origin.lat, lng: origin.lng, type: 'start', status: 'nuevo' },
    ]
  }

  const poles: Pole[] = []

  for (let i = 0; i <= segmentCount; i++) {
    const fraction = i / segmentCount
    const point = interpolate(origin, destination, fraction)

    let type: Pole['type'] = 'intermediate'
    if (i === 0) type = 'start'
    else if (i === segmentCount) type = 'end'

    poles.push({
      sequenceNumber: i + 1,
      lat: point.lat,
      lng: point.lng,
      type,
      status: 'nuevo',
    })
  }

  return poles
}
