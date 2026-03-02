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
    .from('project_comments')
    .select('*, profiles:author_id(email, role)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Flatten the joined profile data
  const comments = data.map((c: Record<string, unknown>) => {
    const profile = c.profiles as Record<string, unknown> | null
    return {
      id: c.id,
      project_id: c.project_id,
      author_id: c.author_id,
      author_email: profile?.email ?? null,
      author_role: profile?.role ?? null,
      content: c.content,
      created_at: c.created_at,
    }
  })

  return NextResponse.json(comments)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { content } = body

  if (!content || typeof content !== 'string') {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('project_comments')
    .insert({
      project_id: id,
      author_id: user.id,
      content,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase.from('audit_log').insert({
    project_id: id,
    user_id: user.id,
    action: 'comment_added',
    details: { content },
  })

  return NextResponse.json(data, { status: 201 })
}
