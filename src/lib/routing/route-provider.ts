import type { LatLng, RouteMode, RouteProviderResult } from '@/types'
import { fetchOSRMRoute } from './osrm'
import { fetchGoogleDirectionsRoute } from './google-directions'

export async function fetchRoute(
  origin: LatLng,
  destination: LatLng,
  mode: RouteMode,
): Promise<RouteProviderResult> {
  switch (mode) {
    case 'road_osrm':
      return fetchOSRMRoute(origin, destination)
    case 'road_google':
      return fetchGoogleDirectionsRoute(origin, destination)
    default:
      throw new Error(`Route mode "${mode}" does not use a routing provider`)
  }
}
