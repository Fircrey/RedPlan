import { NextRequest } from 'next/server'
import { getAuthenticatedUser, verifyProjectOwnership } from '@/lib/api-auth'
import { apiSuccess, apiError, apiUnauthorized, apiNotFound, apiServerError } from '@/lib/api-response'
import { routeSaveSchema } from '@/lib/validations'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params
  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return apiUnauthorized()
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
    return apiServerError(routeError.message)
  }

  if (!route) {
    return apiSuccess(null)
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
    return apiServerError(polesResult.error.message)
  }

  if (segmentsResult.error) {
    return apiServerError(segmentsResult.error.message)
  }

  return apiSuccess({
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
  const { supabase, user } = await getAuthenticatedUser()

  if (!user) {
    return apiUnauthorized()
  }

  // Verify ownership
  const project = await verifyProjectOwnership(supabase, projectId, user.id)
  if (!project) {
    return apiNotFound('Project not found')
  }

  const body = await request.json()
  const parsed = routeSaveSchema.safeParse(body)

  if (!parsed.success) {
    return apiError(parsed.error.issues.map((i) => i.message).join(', '))
  }

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
  } = parsed.data

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
      return apiServerError(updateError.message)
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
      return apiServerError(insertError?.message ?? 'Insert failed')
    }

    routeId = newRoute.id
  }

  // Insert new poles
  if (poles.length > 0) {
    const poleRows = poles.map((pole) => ({
      route_id: routeId,
      sequence_number: pole.sequenceNumber,
      lat: pole.lat,
      lng: pole.lng,
      type: pole.type,
      status: pole.status,
    }))

    const { error: polesError } = await supabase.from('poles').insert(poleRows)

    if (polesError) {
      return apiServerError(polesError.message)
    }
  }

  // Insert new segments
  if (segments.length > 0) {
    const segmentRows = segments.map((seg) => ({
      route_id: routeId,
      from_pole: seg.fromPole,
      to_pole: seg.toPole,
      symbology: seg.symbology,
      color: seg.color || null,
    }))

    const { error: segmentsError } = await supabase.from('route_segments').insert(segmentRows)

    if (segmentsError) {
      return apiServerError(segmentsError.message)
    }
  }

  return apiSuccess({ id: routeId })
}
