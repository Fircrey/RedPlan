import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id, itemId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { description, quantity, unit, unit_cost } = body

  const { data, error } = await supabase
    .from('budget_items')
    .update({ description, quantity, unit, unit_cost })
    .eq('id', itemId)
    .eq('project_id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from('audit_log').insert({
    project_id: id,
    user_id: user.id,
    action: 'budget_item_updated',
    details: { itemId, description, quantity, unit, unit_cost },
  })

  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> },
) {
  const { id, itemId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('budget_items')
    .delete()
    .eq('id', itemId)
    .eq('project_id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from('audit_log').insert({
    project_id: id,
    user_id: user.id,
    action: 'budget_item_deleted',
    details: { itemId },
  })

  return NextResponse.json({ success: true })
}
