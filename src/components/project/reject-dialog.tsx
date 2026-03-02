'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface RejectDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (comment: string) => void
  loading: boolean
}

export function RejectDialog({ open, onClose, onConfirm, loading }: RejectDialogProps) {
  const [comment, setComment] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    onConfirm(comment.trim())
    setComment('')
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Rechazar proyecto</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
            Motivo del rechazo
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Describe el motivo del rechazo..."
            required
            rows={3}
            className="flex w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" variant="danger" disabled={!comment.trim() || loading} className="flex-1">
            {loading ? <Spinner size="sm" /> : 'Rechazar'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
