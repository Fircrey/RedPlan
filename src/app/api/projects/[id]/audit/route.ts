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

  const { data, error } = await supabase
    .from('audit_log')
    .select('*, profiles:user_id(email)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const entries = data.map((e: Record<string, unknown>) => {
    const profile = e.profiles as Record<string, unknown> | null
    return {
      id: e.id,
      project_id: e.project_id,
      user_id: e.user_id,
      user_email: profile?.email ?? null,
      action: e.action,
      details: e.details,
      created_at: e.created_at,
    }
  })

  return NextResponse.json(entries)
}
