import { decode } from '@googlemaps/polyline-codec'
import { OSRM_BASE_URL } from '@/lib/constants'
import type { LatLng, RouteProviderResult } from '@/types'

const OSRM_TIMEOUT_MS = 10_000

export async function fetchOSRMRoute(
  origin: LatLng,
  destination: LatLng,
): Promise<RouteProviderResult> {
  const url = `${OSRM_BASE_URL}/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=polyline`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), OSRM_TIMEOUT_MS)

  try {
    const response = await fetch(url, { signal: controller.signal })

    if (!response.ok) {
      throw new Error(`OSRM request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (data.code !== 'Ok' || !data.routes?.length) {
      throw new Error(`OSRM returned no routes: ${data.code}`)
    }

    const route = data.routes[0]
    const decodedPoints = decode(route.geometry, 5)

    const polylinePoints: LatLng[] = decodedPoints.map(([lat, lng]) => ({ lat, lng }))

    return {
      polylinePoints,
      totalDistanceMeters: route.distance,
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error('OSRM request timed out after 10 seconds')
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
}
