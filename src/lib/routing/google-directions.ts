import { decode } from '@googlemaps/polyline-codec'
import type { LatLng, RouteProviderResult } from '@/types'

export async function fetchGoogleDirectionsRoute(
  origin: LatLng,
  destination: LatLng,
): Promise<RouteProviderResult> {
  const apiKey = process.env.GOOGLE_DIRECTIONS_API_KEY
  if (!apiKey) {
    throw new Error('GOOGLE_DIRECTIONS_API_KEY is not configured')
  }

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${apiKey}`

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Google Directions request failed: ${response.status}`)
  }

  const data = await response.json()

  if (data.status !== 'OK' || !data.routes?.length) {
    throw new Error(`Google Directions returned no routes: ${data.status}`)
  }

  const route = data.routes[0]
  const decodedPoints = decode(route.overview_polyline.points, 5)

  const polylinePoints: LatLng[] = decodedPoints.map(([lat, lng]) => ({ lat, lng }))

  const totalDistanceMeters = route.legs.reduce(
    (sum: number, leg: { distance: { value: number } }) => sum + leg.distance.value,
    0,
  )

  return {
    polylinePoints,
    totalDistanceMeters,
  }
}
