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
      try {
        return await fetchOSRMRoute(origin, destination)
      } catch (osrmError) {
        console.warn('OSRM failed, falling back to Google Directions:', osrmError)
        try {
          return await fetchGoogleDirectionsRoute(origin, destination)
        } catch {
          // If fallback also fails, throw the original OSRM error
          throw osrmError
        }
      }
    case 'road_google':
      return fetchGoogleDirectionsRoute(origin, destination)
    default:
      throw new Error(`Route mode "${mode}" does not use a routing provider`)
  }
}
