import { EARTH_RADIUS_METERS } from '@/lib/constants'
import type { LatLng } from '@/types'

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI
}

/**
 * Compute an intermediate point along the great circle between two coordinates.
 * @param a - Start point
 * @param b - End point
 * @param fraction - Value between 0 (at a) and 1 (at b)
 */
export function interpolate(a: LatLng, b: LatLng, fraction: number): LatLng {
  if (fraction <= 0) return { lat: a.lat, lng: a.lng }
  if (fraction >= 1) return { lat: b.lat, lng: b.lng }

  const lat1 = toRadians(a.lat)
  const lng1 = toRadians(a.lng)
  const lat2 = toRadians(b.lat)
  const lng2 = toRadians(b.lng)

  const dLat = lat2 - lat1
  const dLng = lng2 - lng1

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  const angularDistance = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))

  if (angularDistance < 1e-12) {
    return { lat: a.lat, lng: a.lng }
  }

  const sinD = Math.sin(angularDistance)
  const A = Math.sin((1 - fraction) * angularDistance) / sinD
  const B = Math.sin(fraction * angularDistance) / sinD

  const x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2)
  const y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2)
  const z = A * Math.sin(lat1) + B * Math.sin(lat2)

  return {
    lat: toDegrees(Math.atan2(z, Math.sqrt(x * x + y * y))),
    lng: toDegrees(Math.atan2(y, x)),
  }
}
