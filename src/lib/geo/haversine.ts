import { EARTH_RADIUS_METERS } from '@/lib/constants'
import type { LatLng } from '@/types'

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

/**
 * Calculate distance in meters between two GPS coordinates using the Haversine formula.
 */
export function haversineDistance(a: LatLng, b: LatLng): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)

  const sinHalfLat = Math.sin(dLat / 2)
  const sinHalfLng = Math.sin(dLng / 2)

  const h =
    sinHalfLat * sinHalfLat +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * sinHalfLng * sinHalfLng

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(h))
}
