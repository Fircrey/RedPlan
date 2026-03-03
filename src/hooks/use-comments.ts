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
      const json = await res.json()
      const data = json.data?.comments ?? json.data ?? json
      const list = (Array.isArray(data) ? data : []) as Record<string, unknown>[]
      setComments(
        list.map((c): ProjectComment => ({
          id: c.id as string,
          projectId: c.project_id as string,
          authorId: c.author_id as string,
          authorEmail: c.author_email as string | undefined,
          authorRole: c.author_role as ProjectComment['authorRole'],
          content: c.content as string,
          createdAt: c.created_at as string,
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
