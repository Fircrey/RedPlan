import type { LatLng, Pole } from '@/types'
import { haversineDistance } from './haversine'
import { interpolate } from './interpolate'

/**
 * Distribute poles at equal spacing along a polyline (sequence of GPS points).
 * This is the core algorithm for road-following pole placement.
 *
 * 1. Compute cumulative distances for each vertex
 * 2. For each pole position (i * spacing from start):
 *    - Find which segment it falls on
 *    - Interpolate within that segment
 * 3. Label first as 'start', last as 'end', others as 'intermediate'
 */
export function distributePolesAlongPolyline(
  points: LatLng[],
  spacingMeters: number,
): Pole[] {
  if (points.length < 2) {
    if (points.length === 1) {
      return [
        { sequenceNumber: 1, lat: points[0].lat, lng: points[0].lng, type: 'start', status: 'nuevo' },
      ]
    }
    return []
  }

  // Step 1: cumulative distances
  const cumulativeDistances: number[] = [0]
  for (let i = 1; i < points.length; i++) {
    const segDist = haversineDistance(points[i - 1], points[i])
    cumulativeDistances.push(cumulativeDistances[i - 1] + segDist)
  }

  const totalDistance = cumulativeDistances[cumulativeDistances.length - 1]
  const poleCount = Math.ceil(totalDistance / spacingMeters) + 1

  if (poleCount <= 1) {
    return [
      { sequenceNumber: 1, lat: points[0].lat, lng: points[0].lng, type: 'start', status: 'nuevo' },
    ]
  }

  const poles: Pole[] = []
  let segmentIndex = 0

  for (let i = 0; i < poleCount; i++) {
    const targetDistance = i * spacingMeters
    const clampedDistance = Math.min(targetDistance, totalDistance)

    // Find the segment that contains this distance
    while (
      segmentIndex < points.length - 2 &&
      cumulativeDistances[segmentIndex + 1] < clampedDistance
    ) {
      segmentIndex++
    }

    const segStart = cumulativeDistances[segmentIndex]
    const segEnd = cumulativeDistances[segmentIndex + 1]
    const segLength = segEnd - segStart

    let point: LatLng
    if (segLength < 1e-10) {
      point = { lat: points[segmentIndex].lat, lng: points[segmentIndex].lng }
    } else {
      const fraction = (clampedDistance - segStart) / segLength
      point = interpolate(points[segmentIndex], points[segmentIndex + 1], fraction)
    }

    let type: Pole['type'] = 'intermediate'
    if (i === 0) type = 'start'
    else if (i === poleCount - 1) type = 'end'

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
