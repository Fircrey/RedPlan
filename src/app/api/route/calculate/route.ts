import { NextRequest } from 'next/server'
import { distributePolesStraightLine } from '@/lib/geo/straight-line'
import { distributePolesAlongPolyline } from '@/lib/geo/polyline-distribute'
import { haversineDistance } from '@/lib/geo/haversine'
import { fetchRoute } from '@/lib/routing/route-provider'
import { apiSuccess, apiError, apiServerError } from '@/lib/api-response'
import { calculateRequestSchema, MAX_POLE_COUNT } from '@/lib/validations'
import type { CalculateResponse, LatLng } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = calculateRequestSchema.safeParse(body)

    if (!parsed.success) {
      return apiError(parsed.error.issues.map((i) => i.message).join(', '))
    }

    const { originLat, originLng, destLat, destLng, spacingMeters, mode } = parsed.data

    const origin: LatLng = { lat: originLat, lng: originLng }
    const destination: LatLng = { lat: destLat, lng: destLng }

    let response: CalculateResponse

    if (mode === 'straight_line') {
      const poles = distributePolesStraightLine(origin, destination, spacingMeters)

      if (poles.length > MAX_POLE_COUNT) {
        return apiError(
          `Too many poles (${poles.length}). Maximum is ${MAX_POLE_COUNT}. Increase spacing or shorten the route.`,
        )
      }

      const totalDistance = haversineDistance(origin, destination)

      response = {
        poles,
        polylinePoints: [origin, destination],
        totalDistanceMeters: totalDistance,
        totalPoles: poles.length,
      }
    } else {
      const routeResult = await fetchRoute(origin, destination, mode)
      const poles = distributePolesAlongPolyline(routeResult.polylinePoints, spacingMeters)

      if (poles.length > MAX_POLE_COUNT) {
        return apiError(
          `Too many poles (${poles.length}). Maximum is ${MAX_POLE_COUNT}. Increase spacing or shorten the route.`,
        )
      }

      response = {
        poles,
        polylinePoints: routeResult.polylinePoints,
        totalDistanceMeters: routeResult.totalDistanceMeters,
        totalPoles: poles.length,
      }
    }

    return apiSuccess(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return apiServerError(message)
  }
}
