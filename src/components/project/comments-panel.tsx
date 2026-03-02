'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RoleBadge } from '@/components/ui/role-badge'
import { Spinner } from '@/components/ui/spinner'
import type { ProjectComment, UserRole } from '@/types'

interface CommentsPanelProps {
  comments: ProjectComment[]
  loading: boolean
  onAddComment: (content: string) => Promise<boolean>
  canComment: boolean
}

export function CommentsPanel({ comments, loading, onAddComment, canComment }: CommentsPanelProps) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    await onAddComment(content.trim())
    setContent('')
    setSubmitting(false)
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-[var(--color-text)]">Comentarios</h3>

      {loading ? (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">Sin comentarios</p>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {comments.map((c) => (
            <div key={c.id} className="bg-[var(--color-surface-secondary)] rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-[var(--color-text-secondary)]">
                  {c.authorEmail ?? 'Usuario'}
                </span>
                {c.authorRole && <RoleBadge role={c.authorRole as UserRole} />}
              </div>
              <p className="text-[var(--color-text-secondary)]">{c.content}</p>
              <p className="text-xs text-[var(--color-text-muted)] mt-1">
                {new Date(c.createdAt).toLocaleString('es-CO')}
              </p>
            </div>
          ))}
        </div>
      )}

      {canComment && (
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Agregar comentario..."
            className="flex-1 h-8 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:border-transparent"
          />
          <Button type="submit" size="sm" disabled={!content.trim() || submitting}>
            {submitting ? <Spinner size="sm" /> : 'Enviar'}
          </Button>
        </form>
      )}
    </div>
  )
}
