'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

interface ConciliationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (approved: boolean, comment: string) => void
  loading: boolean
}

export function ConciliationDialog({ open, onClose, onConfirm, loading }: ConciliationDialogProps) {
  const [approved, setApproved] = useState(true)
  const [comment, setComment] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) return
    onConfirm(approved, comment.trim())
    setComment('')
    setApproved(true)
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-4">Registrar conciliacion</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Resultado</label>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="conciliation"
                checked={approved}
                onChange={() => setApproved(true)}
                className="accent-[var(--color-primary)]"
              />
              <span className="text-sm text-[var(--color-text-secondary)]">Aprobada</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="conciliation"
                checked={!approved}
                onChange={() => setApproved(false)}
                className="accent-[var(--color-primary)]"
              />
              <span className="text-sm text-[var(--color-text-secondary)]">Requiere correccion</span>
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-1">
            Observaciones
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Observaciones de la conciliacion..."
            required
            rows={3}
            className="flex w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus-ring)] focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant={approved ? 'primary' : 'danger'}
            disabled={!comment.trim() || loading}
            className="flex-1"
          >
            {loading ? <Spinner size="sm" /> : approved ? 'Aprobar' : 'Enviar a correccion'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
