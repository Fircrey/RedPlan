import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Pole } from '@/types'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
    projectId,
    name,
    originLat,
    originLng,
    destLat,
    destLng,
    spacingMeters,
    mode,
    polylineEncoded,
    totalDistanceMeters,
    totalPoles,
    poles,
  } = body

  if (!projectId || !name) {
    return NextResponse.json({ error: 'projectId and name are required' }, { status: 400 })
  }

  // Insert route
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .insert({
      project_id: projectId,
      name,
      origin_lat: originLat,
      origin_lng: originLng,
      dest_lat: destLat,
      dest_lng: destLng,
      spacing_meters: spacingMeters,
      mode,
      polyline_encoded: polylineEncoded || null,
      total_distance_meters: totalDistanceMeters,
      total_poles: totalPoles,
    })
    .select()
    .single()

  if (routeError) {
    return NextResponse.json({ error: routeError.message }, { status: 500 })
  }

  // Insert poles
  if (poles && Array.isArray(poles) && poles.length > 0) {
    const poleRows = poles.map((pole: Pole) => ({
      route_id: route.id,
      sequence_number: pole.sequenceNumber,
      lat: pole.lat,
      lng: pole.lng,
      type: pole.type,
      status: pole.status,
    }))

    const { error: polesError } = await supabase
      .from('poles')
      .insert(poleRows)

    if (polesError) {
      // Cleanup: delete the route if poles failed
      await supabase.from('routes').delete().eq('id', route.id)
      return NextResponse.json({ error: polesError.message }, { status: 500 })
    }
  }

  return NextResponse.json(route, { status: 201 })
}
