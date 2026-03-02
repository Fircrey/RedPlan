import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Pole, RouteSegment } from '@/types'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Get the most recent route for this project
  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (routeError) {
    return NextResponse.json({ error: routeError.message }, { status: 500 })
  }

  if (!route) {
    return NextResponse.json(null)
  }

  // Get poles and segments for the route
  const [polesResult, segmentsResult] = await Promise.all([
    supabase
      .from('poles')
      .select('*')
      .eq('route_id', route.id)
      .order('sequence_number', { ascending: true }),
    supabase
      .from('route_segments')
      .select('*')
      .eq('route_id', route.id),
  ])

  if (polesResult.error) {
    return NextResponse.json({ error: polesResult.error.message }, { status: 500 })
  }

  if (segmentsResult.error) {
    return NextResponse.json({ error: segmentsResult.error.message }, { status: 500 })
  }

  return NextResponse.json({
    ...route,
    poles: polesResult.data,
    segments: segmentsResult.data,
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const {
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
    segments,
  } = body

  // Find existing route for this project (most recent)
  const { data: existingRoute } = await supabase
    .from('routes')
    .select('id')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let routeId: string

  if (existingRoute) {
    // Update existing route
    const { error: updateError } = await supabase
      .from('routes')
      .update({
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
      .eq('id', existingRoute.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    routeId = existingRoute.id

    // Delete old poles and segments
    await Promise.all([
      supabase.from('poles').delete().eq('route_id', routeId),
      supabase.from('route_segments').delete().eq('route_id', routeId),
    ])
  } else {
    // Create new route
    const { data: newRoute, error: insertError } = await supabase
      .from('routes')
      .insert({
        project_id: projectId,
        name: 'Ruta principal',
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
      .select('id')
      .single()

    if (insertError || !newRoute) {
      return NextResponse.json({ error: insertError?.message ?? 'Insert failed' }, { status: 500 })
    }

    routeId = newRoute.id
  }

  // Insert new poles
  if (poles && Array.isArray(poles) && poles.length > 0) {
    const poleRows = poles.map((pole: Pole) => ({
      route_id: routeId,
      sequence_number: pole.sequenceNumber,
      lat: pole.lat,
      lng: pole.lng,
      type: pole.type,
      status: pole.status,
    }))

    const { error: polesError } = await supabase.from('poles').insert(poleRows)

    if (polesError) {
      return NextResponse.json({ error: polesError.message }, { status: 500 })
    }
  }

  // Insert new segments
  if (segments && Array.isArray(segments) && segments.length > 0) {
    const segmentRows = segments.map((seg: RouteSegment) => ({
      route_id: routeId,
      from_pole: seg.fromPole,
      to_pole: seg.toPole,
      symbology: seg.symbology,
    }))

    const { error: segmentsError } = await supabase.from('route_segments').insert(segmentRows)

    if (segmentsError) {
      return NextResponse.json({ error: segmentsError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ id: routeId })
}
