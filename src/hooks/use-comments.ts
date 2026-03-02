'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ProjectComment } from '@/types'

export function useComments(projectId: string) {
  const [comments, setComments] = useState<ProjectComment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/comments`)
      if (!res.ok) throw new Error('Error al cargar comentarios')
      const data = await res.json()
      setComments(
        data.map((c: Record<string, unknown>) => ({
          id: c.id,
          projectId: c.project_id,
          authorId: c.author_id,
          authorEmail: c.author_email,
          authorRole: c.author_role,
          content: c.content,
          createdAt: c.created_at,
        })),
      )
    } catch {
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  async function addComment(content: string) {
    const res = await fetch(`/api/projects/${projectId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    if (!res.ok) return false
    await fetchComments()
    return true
  }

  return { comments, loading, addComment, refetch: fetchComments }
}
