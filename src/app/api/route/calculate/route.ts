import { NextRequest, NextResponse } from 'next/server'
import type { CalculateRequest, CalculateResponse, LatLng } from '@/types'
import { distributePolesStraightLine } from '@/lib/geo/straight-line'
import { distributePolesAlongPolyline } from '@/lib/geo/polyline-distribute'
import { haversineDistance } from '@/lib/geo/haversine'
import { fetchRoute } from '@/lib/routing/route-provider'

export async function POST(request: NextRequest) {
  try {
    const body: CalculateRequest = await request.json()

    const { originLat, originLng, destLat, destLng, spacingMeters, mode } = body

    // Validate inputs
    if (
      typeof originLat !== 'number' ||
      typeof originLng !== 'number' ||
      typeof destLat !== 'number' ||
      typeof destLng !== 'number' ||
      typeof spacingMeters !== 'number'
    ) {
      return NextResponse.json({ error: 'Invalid coordinates or spacing' }, { status: 400 })
    }

    if (spacingMeters <= 0) {
      return NextResponse.json({ error: 'Spacing must be greater than 0' }, { status: 400 })
    }

    if (!['straight_line', 'road_osrm', 'road_google'].includes(mode)) {
      return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    const origin: LatLng = { lat: originLat, lng: originLng }
    const destination: LatLng = { lat: destLat, lng: destLng }

    let response: CalculateResponse

    if (mode === 'straight_line') {
      const poles = distributePolesStraightLine(origin, destination, spacingMeters)
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

      response = {
        poles,
        polylinePoints: routeResult.polylinePoints,
        totalDistanceMeters: routeResult.totalDistanceMeters,
        totalPoles: poles.length,
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
