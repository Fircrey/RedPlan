import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: route, error: routeError } = await supabase
    .from('routes')
    .select('*')
    .eq('id', id)
    .single()

  if (routeError) {
    return NextResponse.json({ error: 'Route not found' }, { status: 404 })
  }

  const [polesResult, segmentsResult] = await Promise.all([
    supabase
      .from('poles')
      .select('*')
      .eq('route_id', id)
      .order('sequence_number', { ascending: true }),
    supabase
      .from('route_segments')
      .select('*')
      .eq('route_id', id),
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('routes')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
